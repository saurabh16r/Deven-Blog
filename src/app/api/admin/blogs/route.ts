import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog } from '@/lib/models';
import { mockBlogs } from '../../blogs/route';

export async function GET() {
  try {
    try {
      await connectDB();
      const blogs = await Blog.find().sort({ createdAt: -1 });
      return NextResponse.json(blogs);
    } catch (dbError) {
      console.warn('Database error fetching admin blogs, falling back to mock dataset', dbError);
      return NextResponse.json(mockBlogs);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, id, ...updateData } = body;

    // Support bulk actions
    if (action && Array.isArray(ids)) {
      try {
        await connectDB();
        if (action === 'publish') {
          await Blog.updateMany({ _id: { $in: ids } }, { published: true });
        } else if (action === 'unpublish') {
          await Blog.updateMany({ _id: { $in: ids } }, { published: false });
        } else if (action === 'delete') {
          await Blog.deleteMany({ _id: { $in: ids } });
        }
        return NextResponse.json({ success: true });
      } catch {
        ids.forEach(idVal => {
          const idx = mockBlogs.findIndex(b => b._id === idVal);
          if (idx !== -1) {
            if (action === 'publish') mockBlogs[idx].published = true;
            else if (action === 'unpublish') mockBlogs[idx].published = false;
            else if (action === 'delete') mockBlogs.splice(idx, 1);
          }
        });
        return NextResponse.json({ success: true });
      }
    }

    // Support single update
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    try {
      await connectDB();
      const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedBlog) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(updatedBlog);
    } catch {
      const idx = mockBlogs.findIndex(b => b._id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      mockBlogs[idx] = { ...mockBlogs[idx], ...updateData, updatedAt: new Date() };
      return NextResponse.json(mockBlogs[idx]);
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
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    try {
      await connectDB();
      const deleted = await Blog.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    } catch {
      const idx = mockBlogs.findIndex(b => b._id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      mockBlogs.splice(idx, 1);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
