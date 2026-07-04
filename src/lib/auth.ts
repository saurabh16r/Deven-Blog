import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await connectDB();
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) {
          throw new Error('No user found with this email');
        }

        // Compare passwords
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        // Return user details for NextAuth session
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || '',
          role: user.role,
          plan: user.plan === 'pro' ? 'premium' : user.plan,
          subscriptionStatus: user.subscriptionStatus,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await connectDB();
        
        // Try to find the user by email
        let existingUser = await User.findOne({ email: user.email?.toLowerCase() });
        
        if (!existingUser) {
          // If first login, create new user
          existingUser = await User.create({
            name: user.name,
            email: user.email?.toLowerCase(),
            image: user.image || '',
            provider: 'google',
            role: 'user',
            plan: 'free',
            subscriptionStatus: 'inactive',
            articlesRead: 0,
            freeArticlesRead: 0,
            readArticles: [],
            bookmarks: [],
          });
        } else if (existingUser.provider !== 'google') {
          // If the user registered via email/password first, link/update provider or allow login
          existingUser.provider = 'google';
          if (user.image && !existingUser.image) {
            existingUser.image = user.image;
          }
          await existingUser.save();
        }

        // Inject db details into the user object so it gets passed to jwt callback
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        user.plan = existingUser.plan === 'pro' ? 'premium' : existingUser.plan;
        user.subscriptionStatus = existingUser.subscriptionStatus;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan === 'pro' ? 'premium' : user.plan;
        token.subscriptionStatus = user.subscriptionStatus;
        token.name = user.name;
        token.picture = user.image || '';
      } else if (token.id) {
        // Retrieve fresh user info from DB on page transitions
        try {
          await connectDB();
          const latestUser = await User.findById(token.id).select('name role plan subscriptionStatus image').lean();
          if (latestUser) {
            token.role = latestUser.role;
            token.plan = latestUser.plan === 'pro' ? 'premium' : latestUser.plan;
            token.subscriptionStatus = latestUser.subscriptionStatus;
            token.name = latestUser.name;
            token.picture = latestUser.image || '';
          }
        } catch (error) {
          console.error('Error fetching user for JWT update:', error);
        }
      }

      // Handle session update triggers from client
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plan = token.plan;
        session.user.subscriptionStatus = token.subscriptionStatus;
        if (token.name) session.user.name = token.name;
        if (token.picture !== undefined) session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_founderbrief_2026',
};
