import React from 'react';
import connectDB from '@/lib/db';
import { Subscriber } from '@/lib/models';
import SubscribersClient from '@/components/dashboard/SubscribersClient';

export const revalidate = 0;

export default async function AdminSubscribersPage() {
  await connectDB();
  const dbSubs = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
  const subscribers = JSON.parse(JSON.stringify(dbSubs));

  return <SubscribersClient initialSubscribers={subscribers} />;
}
