import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        if (!token?.role) {
          return false;
        }
        return token.role === "ADMIN" || token.role === "EDITOR";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
