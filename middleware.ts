import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {},
  {
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    "/my-orders",
    "/my-orders/:path*",
    "/wishlist",
    "/api/orders/my-orders",
    "/api/orders/:path*",
    "/api/wishlist/:path*",
  ],
}
