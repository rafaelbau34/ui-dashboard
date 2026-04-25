import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;

        // Find user by name
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.name, credentials.name as string))
          .limit(1);
        const user = userResult[0];

        if (!user) return null;

        // Verify password
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (passwordsMatch) {
          return { id: user.id.toString(), name: user.name };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});
