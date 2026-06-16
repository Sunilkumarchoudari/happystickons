import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Create mock product if empty for testing
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.create({
        name: 'Classic Magnet',
        shape: 'Square',
        sizeOptions: [{ size: 'Small (2x2")', price: 5 }, { size: 'Large (3x3")', price: 8 }],
        isActive: true,
      });
      await Product.create({
        name: 'Round Magnet',
        shape: 'Round',
        sizeOptions: [{ size: 'Small (2" Dia)', price: 5 }, { size: 'Large (3" Dia)', price: 8 }],
        isActive: true,
      });
    }
    
    const products = await Product.find({ isActive: true });
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

