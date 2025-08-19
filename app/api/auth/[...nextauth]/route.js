import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../../lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        account_email: { label: "Email", type: "text" },
        account_password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { account_email, account_password } = credentials || {};
        if (!account_email || !account_password) throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");

        const [users] = await pool.query(
          "SELECT * FROM account WHERE account_email = ?",
          [account_email]
        );

        if (users.length > 0) {
          const user = users[0];
          const isValid = await bcrypt.compare(account_password, user.account_password);
          if (isValid) {
            return {
              id: user.account_id,
              name: user.account_name,
              email: user.account_email,
              role: user.account_role,
              phone: user.account_phone,
              address: user.account_address,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.address = token.address;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 ชั่วโมง (28,800 วินาที)
    rolling: false, // ปิด rolling session เพื่อให้หมดอายุแบบ strict
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };