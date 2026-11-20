const publicExactRoutes = new Set([
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/password-recovery/request",
  "/api/auth/password-recovery/verify",
  "/api/auth/password-recovery/reset",
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
