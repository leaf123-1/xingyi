import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { UserRole } from "@prisma/client";

// 统一管理 NextAuth 配置，便于在服务端调用 getServerSession
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "凭证登录",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.passwordHash) {
          return null;
        }
        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM ?? "no-reply@xingyi.local",
      // 预留邮件登录通道，后续可接入真实邮件服务
      async sendVerificationRequest({ identifier, url }) {
        console.info("[email-login] 验证链接", identifier, url);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? token.role;
      }
      if (!token.role && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as UserRole) ?? UserRole.CUSTOMER;
      }
      return session;
    },
  },
};
