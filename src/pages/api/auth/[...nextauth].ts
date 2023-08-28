import { ILogin } from '@models/auth.types';
import { ICustomResponse } from '@models/global.types';
import axios, { AxiosResponse } from 'axios';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

type TLoginResponse = AxiosResponse<ICustomResponse<ILogin>>;

async function refreshAccessToken(token: string) {
  const { data } = await axios.post<string, TLoginResponse, any>(
    `${process.env.API_BASE}refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data.result.authorization.token;
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'laravel-backend',
      type: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'mail@domain.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, req) => {
        const { email, password } = credentials;

        const { data } = await axios.post<
          string,
          TLoginResponse,
          { email: string; password: string }
        >(`${process.env.API_BASE}login`, { email, password });

        if (data.result) {
          const user = {
            ...data.result.user,
            business: data.result.business,
            token: data.result.authorization.token,
            business: (data.result as any).business,
          };

          return user as any;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 1 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) token.user = user as any;

      return token;
    },
    async session({ session, token, user }) {
      if (!session) return;
      if (token.user) {
        session.user = token.user;
        session.token = token.user.token;
      }

      return session;
    },
  },
};
export default NextAuth(authOptions);
