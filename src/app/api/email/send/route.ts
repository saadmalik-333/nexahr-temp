import { NextRequest, NextResponse } from 'next/server';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'approval') {
      const result = await sendApprovalEmail(data);
      return NextResponse.json(result);
    } else if (type === 'rejection') {
      const result = await sendRejectionEmail(data);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
