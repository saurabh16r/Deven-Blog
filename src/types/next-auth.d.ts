import DefaultAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    plan?: string;
    subscriptionStatus?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      plan?: string;
      subscriptionStatus?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    plan?: string;
    subscriptionStatus?: string;
  }
}
