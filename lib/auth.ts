import { env } from "@/env.mjs";
import prisma from "@/lib/prisma";
import { sendVerificationRequest } from "@/lib/resend/emails/sendVerificationRequest";
import { createOrRetrieveCustomer } from "@/pages/api/v1/stripe/checkout";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import worksmart from "./services/worksmart";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as PrismaClient),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    EmailProvider({
      type: "email",
      server: "",
      from: env.RESEND_FROM_ADDRESS,
      sendVerificationRequest,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // Only enable credentials auth in development mode
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "Credentials",
            credentials: {
              email: {
                label: "Username",
                type: "email",
                placeholder: "johndoe@gmail.com",
              },
              password: { label: "Password", type: "password" },
            },
            async authorize(
              credentials: Record<"email" | "password", string> | undefined,
              req
            ) {
              if (credentials === undefined) return null;

              const existingUser = await worksmart.signin(
                credentials.email,
                credentials.password
              );
              if (!existingUser) return null;

              return existingUser;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        // session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      const email = token?.email ?? "_";
      let dbUser: {
        id: string;
        Email?: string;
        name?: string;
        avatar?: { url?: string };
      } = { id: token.id };
      if (email != "_") {
        dbUser = await worksmart.getUser(email);
        if (!dbUser) {
          dbUser = await worksmart.createUser(email, "", user.id);
        }
      }

      return {
        id: dbUser?.id,
        name: dbUser?.name ?? user?.name,
        email: dbUser?.Email ?? user?.email,
        picture: dbUser?.avatar?.url ?? user?.image ?? token?.picture,
      };
    },
  },
  events: {
    signIn: async ({ profile, account, user }) => {
      if (account?.provider === "github" && profile) {
        const res = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `token ${account.access_token}` },
        });

        const emails = await res.json();

        if (emails?.length > 0) {
          profile.email = emails.sort(
            (a: any, b: any) => b.primary - a.primary
          )[0].email;

          if (profile.email) {
            const existingUser = await worksmart.getUser(profile.email);
            if (existingUser == null) {
              await worksmart.createUser(
                profile.email,
                account!.provider,
                user.id
              );
            }
          }
        }
      }
    },
    updateUser: async (message) => {
      const existingUser = await worksmart.getUser(message.user.email || "_");
    },
    createUser: async (message) => {
      // await createOrRetrieveCustomer({
      //   uuid: message.user.id as string,
      //   email: message.user.email || "_",
      // });

      if (process.env.NODE_ENV !== "production") return;
      // await axios.post(
      //   "https://hooks.slack.com/services/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",
      //   {
      //     text: `${message.user.email} just signed up! 🎉`,
      //   }
      // );
    },
  },
};
