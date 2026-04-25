import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");

  // Redirect unauthenticated users to the login page
  if (!isLoggedIn && !isOnLoginPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect authenticated users away from the login page
  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

// Exclude Next.js internals, API routes, and static files from the middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
