import NextAuth from "next-auth";
import type { UserRole } from "@prisma/client";
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: (DefaultUser & {
      id: string;
      role: UserRole;
    }) | undefined;
  }

  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
