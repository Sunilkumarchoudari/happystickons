import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    let banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });

    if (banners.length === 0) {
      // Seed default banners
      banners = await Banner.create([
        {
          title: 'Welcome to Happy Stick Ons',
          subtitle: 'Turn your digital memories into premium physical magnets.',
          bgGradient: 'linear-gradient(135deg, #B49D85, #88644F)',
          textColor: '#FFFFFF',
          linkUrl: '/create',
          isActive: true
        },
        {
          title: 'The Perfect Corporate Gift',
          subtitle: 'Custom branding and bulk discounts available.',
          bgGradient: 'linear-gradient(135deg, #88644F, #4F2C1F)',
          textColor: '#ECE7DA',
          linkUrl: '/create',
          isActive: true
        },
        {
          title: 'Buy 2 Get 1 Free!',
          subtitle: 'Use code HAPPY20 at checkout for limited time offers.',
          bgGradient: 'linear-gradient(135deg, #4F2C1F, #B49D85)',
          textColor: '#ECE7DA',
          linkUrl: '/create',
          isActive: true
        }
      ]);
    }
    return NextResponse.json(banners, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
