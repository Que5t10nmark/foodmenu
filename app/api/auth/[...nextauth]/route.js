import NextAuth from "next-auth";
import pool from "@/lib/pool"; //เชื่อมต่อฐานข้อมูล
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "email" },
        password: {
          label: "password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter an email and password.");
        }
        const { email, password } = credentials;

        try {
          //ตรวจสอบผู้ใช้ในฐานข้อมูล
          const [accountRows] = await pool.query(
            "SELECT * FROM account WHERE email = ? AND (is_admin = 1 OR is_admin = 0)",
            [email]
          );

          if (accountRows && accountRows.length > 0) {
            const user = userRows[0];
            const isPasswordValid = await bcrypt.compare(
              password,
              user.account_password
            );

            if (isPasswordValid) return null;

            const role = user.is_admin ? "admin" : "user";
            return {
              id: user.account_id,
              username: user.account_username,
              email: user.account_email,
              role: role,
              is_admin: user.is_admin,
            };
          }

          //ตรวจสอบผู้ใช้ในฐานข้อมูล person
          const [PersonRows] = await pool.query(
            "SELECT * FROM person WHERE email = ?",
            [email]
          );
          if (PersonRows && PersonRows.length > 0) {
            const user = PersonRows[0];
            return {
              id: user.person.id,
              username: user.person.username,
              email: user.person.email,
              role: "user",
              is_admin: false,
            };
          }
        } catch (error) {
          console.error(error);
          return null;
        }
        return null;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.is_admin = user.is_admin || false;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.is_admin = token.is_admin;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  pages: {
    signIn: "/",
    error: "/login?error=true",
    signOut: "/auth/signout",
    callbackurl: "/auth/redirect",
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
