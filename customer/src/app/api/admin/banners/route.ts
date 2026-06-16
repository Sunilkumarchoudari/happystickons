import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find().sort({ createdAt: -1 });
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { title, subtitle, bgGradient, textColor, linkUrl, isActive } = await request.json();
    const banner = await Banner.create({
      title,
      subtitle,
      bgGradient,
      textColor,
      linkUrl,
      isActive: isActive !== undefined ? isActive : true
    });
    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create banner', details: error.message }, { status: 500 });
  }
}
