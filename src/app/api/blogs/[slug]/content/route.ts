import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Blog, User } from '@/lib/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (user.plan !== 'premium' && user.plan !== 'pro') {
      return NextResponse.json({ error: 'Premium subscription required.' }, { status: 403 });
    }

    const blog = await Blog.findOne({ slug, published: true }).lean();
    if (!blog) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({
      content: blog.content
    });
  } catch (error: any) {
    console.error('Fetch article content error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
