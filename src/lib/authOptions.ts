import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kycStatus: user.kycStatus,
          kycSubmittedAt: user.kycSubmittedAt,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 Days
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: find or create the user in our DB
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create a new minimal agent account from Google
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "AGENT",
                // kycSubmittedAt stays null = hasn't submitted KYC yet
              }
            });
          }
          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // On sign-in, copy values from user object as initial fallback
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.kycStatus = (user as any).kycStatus;
        token.kycSubmittedAt = (user as any).kycSubmittedAt;
      }

      // Always fetch fresh data from DB so admin approval reflects immediately
      const lookupId = (token.id as string) || undefined;
      const lookupEmail = token.email || undefined;
      if (lookupId || lookupEmail) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: lookupId ? { id: lookupId } : { email: lookupEmail }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.kycStatus = dbUser.kycStatus;
            token.kycSubmittedAt = dbUser.kycSubmittedAt;
          }
        } catch {
          // DB unreachable — keep values from user object set above
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).kycStatus = token.kycStatus;
        (session.user as any).kycSubmittedAt = token.kycSubmittedAt;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
};
