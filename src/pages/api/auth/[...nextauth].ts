import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: '/auth/signin', // Optional: customization
  },
  callbacks: {
      async session({ session, token, user }) {
          return session;
      }
  }
}

export default NextAuth(authOptions)
