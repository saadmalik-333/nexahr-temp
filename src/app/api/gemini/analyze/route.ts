import { NextRequest, NextResponse } from 'next/server';
import { analyzeCandidate } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, designation, department, experience, description } = body;

    if (!name || !designation || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const analysis = await analyzeCandidate({
      name,
      designation,
      department,
      experience: experience || 0,
      description: description || 'No description provided',
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
