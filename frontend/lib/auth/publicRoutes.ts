const publicExactRoutes = new Set([
  "/login",
  "/api/auth/login",
  "/cadastro",
  "/recuperar-senha",
]);

const publicRoutePrefixes = ["/cadastro/", "/recuperar-senha/"];

export function isPublicRoute(pathname: string): boolean {
  return (
    publicExactRoutes.has(pathname) ||
    publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}
