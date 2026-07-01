import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Author, Blog } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authors = await Author.find().sort({ name: 1 });
    return NextResponse.json(authors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, avatar, bio, linkedin, twitter, website } = body;
    if (!name || !role || !avatar || !bio) {
      return NextResponse.json({ error: 'Name, role, avatar, and bio are required' }, { status: 400 });
    }

    await connectDB();
    const author = await Author.create({
      name,
      role,
      avatar,
      bio,
      linkedin: linkedin || '',
      twitter: twitter || '',
      website: website || ''
    });
    return NextResponse.json(author, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, role, avatar, bio, linkedin, twitter, website } = body;
    if (!id || !name || !role || !avatar || !bio) {
      return NextResponse.json({ error: 'ID, name, role, avatar, and bio are required' }, { status: 400 });
    }

    await connectDB();
    const author = await Author.findByIdAndUpdate(
      id,
      {
        name,
        role,
        avatar,
        bio,
        linkedin: linkedin || '',
        twitter: twitter || '',
        website: website || ''
      },
      { new: true }
    );
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    return NextResponse.json(author);
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

    // Check if author has articles written
    const articlesCount = await Blog.countDocuments({ authorId: id });
    if (articlesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete author because they have articles assigned to them.' },
        { status: 400 }
      );
    }

    await Author.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
