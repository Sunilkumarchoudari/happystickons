import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    if (!token || !token.startsWith('customer-token-')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = token.replace('customer-token-', '');
    const user = await User.findById(userId);
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ 
      user: { 
        name: user.name, 
        email: user.email,
        id: user._id
      } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
