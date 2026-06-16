import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findOne({ email, password });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    return NextResponse.json({ token: 'customer-token-' + user._id, user: { name: user.name, email: user.email } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
