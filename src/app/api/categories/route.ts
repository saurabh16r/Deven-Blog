import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Category } from '@/lib/models';

let mockCategories = [
  { _id: '1', name: 'Startups', slug: 'startups' },
  { _id: '2', name: 'AI', slug: 'ai' },
  { _id: '3', name: 'Growth', slug: 'growth' },
  { _id: '4', name: 'Marketing', slug: 'marketing' },
  { _id: '5', name: 'Fundraising', slug: 'fundraising' },
  { _id: '6', name: 'Operations', slug: 'operations' },
];

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });
    if (categories.length === 0) {
      // Seed categories for empty DB
      await Category.insertMany(mockCategories);
      return NextResponse.json(mockCategories);
    }
    return NextResponse.json(categories);
  } catch (error) {
    console.warn('Database error, falling back to mock categories', error);
    return NextResponse.json(mockCategories);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    try {
      await connectDB();
      const existing = await Category.findOne({ slug });
      if (existing) {
        return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
      }
      const category = await Category.create({ name, slug });
      return NextResponse.json(category, { status: 201 });
    } catch {
      const newCat = { _id: String(Date.now()), name, slug };
      mockCategories.push(newCat);
      return NextResponse.json(newCat, { status: 201 });
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
      await Category.findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    } catch {
      mockCategories = mockCategories.filter(c => c._id !== id);
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
