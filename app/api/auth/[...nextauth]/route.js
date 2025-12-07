import NextAuth from "next-auth";
import credentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    credentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        //? mencari user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Email tidak terdaftar!");
        }

        //? cek password pakai Bun native -> user.password adalah hash dari database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah!");
        }

        //? login berhasil
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  //? Config Sesson
  session: {
    strategy: "jwt",
  },

  //? Config Login
  pages: {
    signIn: "/login", // -> jika blm login, lempar ke login
  },

  //? Callback
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub; // -> memasukkan ID user ke object session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
