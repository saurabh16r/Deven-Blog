import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import SettingsClient from './SettingsClient';

export const revalidate = 0;

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) {
    redirect('/login');
  }

  const initialUser = {
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image || '',
    provider: dbUser.provider || 'credentials',
  };

  return <SettingsClient initialUser={initialUser} />;
}
