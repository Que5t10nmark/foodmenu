import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      if (token) {
        const role = token.role;
        if (path.startsWith("/backoffice") && role !== "เจ้าของร้าน") return false;
        if (path.startsWith("/kitchen") && role !== "พนักงาน" && role !== "เจ้าของร้าน") return false;
        return true;
      }
      return path === "/login" || path === "/register";
    },
  },
});

export const config = {
  matcher: ["/backoffice/:path*", "/kitchen/:path*"],
};