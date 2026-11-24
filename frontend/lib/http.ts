export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  codigo?: string;
  message: string;
  path: string;
  erros: Array<{ campo: string; mensagem: string }>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly response: ApiErrorResponse,
  ) {
    super(response.message);
    this.name = "ApiError";
  }
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  responseType?: "json" | "text" | "blob";
  retry?: boolean;
}

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    return "/api/v1";
  }

  return `${configured.replace(/\/+$/, "")}/api/v1`;
}

function buildUrl(
  path: string,
  params?: HttpRequestOptions["params"],
): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;
  const url = new URL(
    `${base}${normalizedPath}`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return typeof window === "undefined" && url.origin === "http://localhost"
    ? `${url.pathname}${url.search}`
    : url.toString();
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}

let refreshPromise: Promise<Response> | null = null;
let invalidationPromise: Promise<void> | null = null;

const publicAuthPaths = new Set([
  "/auth/login",
  "/auth/cadastro",
  "/auth/recuperar-senha",
  "/auth/verificar-codigo",
  "/auth/redefinir-senha",
]);

async function refreshSession(): Promise<Response> {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-FrotaSync-Client": "web" },
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function invalidateSession(): Promise<void> {
  if (!invalidationPromise) {
    invalidationPromise = fetch(buildUrl("/auth/logout"), {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-FrotaSync-Client": "web" },
    })
      .catch(() => undefined)
      .then(() => undefined)
      .finally(() => {
        invalidationPromise = null;
      });
  }
  await invalidationPromise;
  redirectToLogin();
}

async function readError(response: Response): Promise<ApiErrorResponse> {
  if (response.status === 204) {
    return {
      timestamp: new Date().toISOString(),
      status: response.status,
      error: "NO_CONTENT",
      message: "Sem conteúdo",
      path: "",
      erros: [],
    };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as ApiErrorResponse;
  }

  return {
    timestamp: new Date().toISOString(),
    status: response.status,
    error: "HTTP_ERROR",
    message: `Falha na requisição (${response.status})`,
    path: "",
    erros: [],
  };
}

export async function http<T>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers = new Headers(options.headers);
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (isWrite) {
    headers.set("X-FrotaSync-Client", "web");
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body instanceof Blob) {
    body = options.body;
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  let response = await fetch(buildUrl(path, options.params), {
    method,
    headers,
    body,
    credentials: "same-origin",
  });

  const isRefresh = path === "/auth/refresh";
  const isPublicAuthRequest =
    publicAuthPaths.has(path) ||
    path === "/auth/logout";
  if (
    response.status === 401 &&
    !isRefresh &&
    !isPublicAuthRequest &&
    options.retry !== true
  ) {
    const refreshResponse = await refreshSession();
    if (!refreshResponse.ok) {
      await invalidateSession();
      throw new ApiError(refreshResponse.status, await readError(refreshResponse));
    }

    response = await fetch(buildUrl(path, options.params), {
      method,
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : options.body instanceof Blob
            ? options.body
            : options.body !== undefined
              ? JSON.stringify(options.body)
              : undefined,
      credentials: "same-origin",
    });

    if (response.status === 401) {
      await invalidateSession();
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (options.responseType === "blob") {
    return (await response.blob()) as T;
  }
  if (options.responseType === "text") {
    return (await response.text()) as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }
  return (await response.json()) as T;
}
