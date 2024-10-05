import { Adapter, AdapterUser, AdapterSession, VerificationToken } from "next-auth/adapters";
import { type WorksmartType } from "../services/worksmart";

export function WorksmartAdapter(worksmartInstance: WorksmartType): Adapter {
  return {
    async createUser(user) {
      const newUser = await worksmartInstance.createUser(user.email!, user.providerAccountId!, user.provider!);
      return {
        id: newUser.id,
        email: newUser.Email,
        emailVerified: null,
      };
    },

    async getUser(id) {
      const user = await worksmartInstance.getUser(id);
      if (!user) return null;
      return {
        id: user.id,
        email: user.Email,
        emailVerified: null,
      };
    },

    async getUserByEmail(email) {
      const user = await worksmartInstance.getUser(email);
      if (!user) return null;
      return {
        id: user.id,
        email: user.Email,
        emailVerified: null,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const user = await worksmartInstance.getUser(providerAccountId);
      if (!user) return null;
      return {
        id: user.id,
        email: user.Email,
        emailVerified: null,
      };
    },

    async updateUser(user) {
      // Implement user update logic if needed
      return user as AdapterUser;
    },

    async linkAccount(account) {
      // Implement account linking logic if needed
    },

    async createSession({ sessionToken, userId, expires }) {
      // Implement session creation logic if needed
      return { sessionToken, userId, expires };
    },

    async getSessionAndUser(sessionToken) {
      // Implement session and user retrieval logic if needed
      return null;
    },

    async updateSession(session) {
      // Implement session update logic if needed
      return session as AdapterSession;
    },

    async deleteSession(sessionToken) {
      // Implement session deletion logic if needed
    },

    async createVerificationToken(verificationToken: VerificationToken) {
      // Implement verification token creation logic if needed
      return worksmartInstance.createToken(verificationToken);
    },

    async useVerificationToken({ identifier, token }) {
      // Implement verification token usage logic if needed
      return worksmartInstance.fetchToken({ identifier, token });
    },
  };
}