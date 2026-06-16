import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const banner = await Banner.findByIdAndUpdate(id, body, { new: true });
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    return NextResponse.json(banner);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update banner', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete banner', details: error.message }, { status: 500 });
  }
}
