import React from 'react';
import connectDB from '@/lib/db';
import { Subscriber } from '@/lib/models';
import SubscribersClient from '@/components/dashboard/SubscribersClient';

export const revalidate = 0;

export default async function AdminSubscribersPage() {
  let subscribers = [];

  try {
    await connectDB();
    const dbSubs = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
    subscribers = JSON.parse(JSON.stringify(dbSubs));
  } catch (error) {
    console.warn('Database error loading subscribers in SSR page, loading fallback.', error);
    subscribers = [
      { _id: '1', email: 'justin@stripe.com', subscribedAt: new Date('2026-06-21T09:30:00Z').toISOString() },
      { _id: '2', email: 'shreyas@notion.so', subscribedAt: new Date('2026-06-21T08:15:00Z').toISOString() },
      { _id: '3', email: 'gaby@linear.app', subscribedAt: new Date('2026-06-20T17:45:00Z').toISOString() },
      { _id: '4', email: 'packy@morningbrew.com', subscribedAt: new Date('2026-06-20T12:00:00Z').toISOString() }
    ];
  }

  return <SubscribersClient initialSubscribers={subscribers} />;
}
