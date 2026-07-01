import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Blog, User } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required.' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user || user.plan !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required.' }, { status: 403 });
    }

    const blog = await Blog.findOne({ slug, published: true }).select('aiSummary').lean();
    if (!blog) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ summary: blog.aiSummary });
  } catch (error: any) {
    console.error('Fetch AI summary error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
