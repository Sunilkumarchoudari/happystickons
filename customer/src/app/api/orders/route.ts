import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { customerName, email, address, items, totalAmount } = await request.json();
    const order = await Order.create({
      customerName,
      email,
      address,
      items,
      totalAmount,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const query = email ? { email } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
