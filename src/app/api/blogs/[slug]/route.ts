import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Blog, Author, User } from '@/lib/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();
    const blogDoc = await Blog.findOneAndUpdate(
      { slug, published: true },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    ).populate('authorId').lean();
    
    if (!blogDoc) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const blog = JSON.parse(JSON.stringify(blogDoc));

    // Security: Check if user is premium or admin
    const session = await getServerSession(authOptions);
    let isPremiumOrAdmin = false;
    
    if (session?.user) {
      if (session.user.role === 'admin') {
        isPremiumOrAdmin = true;
      } else {
        const user = await User.findOne({ email: session.user.email }).lean();
        if (user && (user.plan === 'premium' || user.plan === 'pro')) {
          isPremiumOrAdmin = true;
        }
      }
    }

    // Strip audioUrl if user is not premium/admin
    if (!isPremiumOrAdmin) {
      blog.audioUrl = '';
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
