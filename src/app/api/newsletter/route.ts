import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Subscriber } from '@/lib/models';

let mockSubscribers = [
  { _id: '1', email: 'alex@linear.app', subscribedAt: new Date('2026-05-10') },
  { _id: '2', email: 'sarah@stripe.com', subscribedAt: new Date('2026-06-01') },
  { _id: '3', email: 'marc@notion.so', subscribedAt: new Date('2026-06-15') },
  { _id: '4', email: 'jeff@morningbrew.com', subscribedAt: new Date('2026-06-20') },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    try {
      await connectDB();
      const filter = search ? { email: { $regex: search, $options: 'i' } } : {};
      const subs = await Subscriber.find(filter).sort({ subscribedAt: -1 });
      return NextResponse.json(subs);
    } catch (dbError) {
      console.warn('Database error, using mock subscribers list', dbError);
      const filtered = mockSubscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
      return NextResponse.json(filtered);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    try {
      await connectDB();
      const existing = await Subscriber.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 });
      }
      const newSub = await Subscriber.create({ email: email.toLowerCase() });
      return NextResponse.json({ success: true, subscriber: newSub });
    } catch (dbError) {
      console.warn('Database error, storing subscriber in memory', dbError);
      const existing = mockSubscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 });
      }
      const newSub = { _id: String(Date.now()), email: email.toLowerCase(), subscribedAt: new Date() };
      mockSubscribers.push(newSub);
      return NextResponse.json({ success: true, subscriber: newSub });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
      await connectDB();
      await Subscriber.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    } catch {
      mockSubscribers = mockSubscribers.filter(s => s._id !== id);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
