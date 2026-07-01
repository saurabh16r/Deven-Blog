import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Blog, Author } from '@/lib/models';
import { generateSummary } from '@/lib/gemini';

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('authorId');
    return NextResponse.json(blogs);
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
      await connectDB();
      if (action === 'publish') {
        const blogsToPublish = await Blog.find({ _id: { $in: ids } });
        for (const blogToPub of blogsToPublish) {
          let aiSummary = blogToPub.aiSummary;
          if (blogToPub.aiSummaryEnabled !== false && !aiSummary) {
            try {
              aiSummary = await generateSummary(blogToPub.title, blogToPub.content);
            } catch (err) {
              console.error(`Failed to generate summary for blog ${blogToPub._id} during bulk publish:`, err);
            }
          }
          await Blog.findByIdAndUpdate(blogToPub._id, { published: true, aiSummary });
        }
      } else if (action === 'unpublish') {
        await Blog.updateMany({ _id: { $in: ids } }, { published: false });
      } else if (action === 'delete') {
        await Blog.deleteMany({ _id: { $in: ids } });
      }
      return NextResponse.json({ success: true });
    }

    // Support single update
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    await connectDB();

    // Auto-generate summary on publish if enabled and not already provided
    if (updateData.published && updateData.aiSummaryEnabled !== false && !updateData.aiSummary) {
      const existing = await Blog.findById(id);
      if (existing) {
        const title = updateData.title || existing.title;
        const content = updateData.content || existing.content;
        if (title && content) {
          try {
            updateData.aiSummary = await generateSummary(title, content);
          } catch (err) {
            console.error(`Failed to auto-generate summary for blog ${id} during publish:`, err);
          }
        }
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json(updatedBlog);
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

    await connectDB();
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
