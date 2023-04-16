import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/db/prisma';
import { compare } from 'bcrypt';
import { DefaultSession } from 'next-auth';
import { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user?: User & DefaultSession['user'];
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials): Promise<User | null> {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        if (!email || !password) {
          throw new Error('Missing email or password');
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !(await compare(password, user.password))) {
          throw new Error('Invalid email or password');
        }
        return user;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
