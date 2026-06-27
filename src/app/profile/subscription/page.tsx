import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import Subscription from '@/lib/models/Subscription';
import SubscriptionClient from './SubscriptionClient';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email }).lean();

  if (!dbUser) {
    redirect('/login');
  }

  // Find the user's active subscription details
  const dbSub = await Subscription.findOne({ 
    userId: dbUser._id, 
    status: { $in: ['active', 'cancelled'] }
  })
  .sort({ createdAt: -1 })
  .lean();

  const endDateFormatted = dbSub && dbSub.endDate ? formatDate(dbSub.endDate) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-sm uppercase font-extrabold tracking-widest text-primary mb-1">
          Membership
        </h2>
        <h1 className="text-3xl font-serif font-black tracking-tight text-foreground">
          Subscription Plan
        </h1>
        <p className="text-muted text-sm font-medium mt-1">
          Manage your membership and billing details.
        </p>
      </div>

      <SubscriptionClient
        initialPlan={dbUser.plan}
        initialStatus={dbUser.subscriptionStatus}
        endDate={endDateFormatted}
      />
    </div>
  );
}
