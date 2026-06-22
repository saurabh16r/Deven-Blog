import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Subscriber } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    await connectDB();
    const filter = search ? { email: { $regex: search, $options: 'i' } } : {};
    const subs = await Subscriber.find(filter).sort({ subscribedAt: -1 });
    return NextResponse.json(subs);
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

    await connectDB();
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'This email is already subscribed' }, { status: 400 });
    }
    const newSub = await Subscriber.create({ email: email.toLowerCase() });
    return NextResponse.json({ success: true, subscriber: newSub });
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

    await connectDB();
    await Subscriber.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
