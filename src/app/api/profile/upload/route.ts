import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 3. Validation: Format (JPG, JPEG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported Format. Please select a JPG, JPEG, PNG, or WEBP image.' },
        { status: 400 }
      );
    }

    // 4. Validation: Size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image Too Large. The maximum allowed size is 5 MB.' },
        { status: 400 }
      );
    }

    // 5. Read file into buffer in-memory (no local file storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Convert to data URI for Cloudinary support
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 7. Upload to Cloudinary folder founderbrief/profile-images/
    const url = await uploadImage(base64Image, 'founderbrief/profile-images');

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Profile image upload handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload Failed. Please try again.' },
      { status: 500 }
    );
  }
}
