import NextAuth from "next-auth";
import { authOptions } from "@/services/auth";

export default NextAuth(authOptions);
