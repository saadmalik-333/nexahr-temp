import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { analyzeCandidate } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const designation = formData.get('designation') as string;
    const department = formData.get('department') as string;
    const experienceYears = parseInt(formData.get('experienceYears') as string) || 0;
    const description = formData.get('description') as string;
    const photo = formData.get('photo') as File | null;

    // Validate required fields
    if (!fullName || !email || !phone || !designation || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 409 }
      );
    }

    // Upload photo to Supabase Storage
    let photoUrl = null;
    if (photo) {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(fileName, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('employee-photos')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    // Run Gemini AI analysis
    let aiScore = null;
    let aiSummary = null;
    try {
      const analysis = await analyzeCandidate({
        name: fullName,
        designation,
        department,
        experience: experienceYears,
        description: description || 'No description provided',
      });
      aiScore = analysis.score;
      aiSummary = JSON.stringify(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // Insert employee record
    const { data: employee, error: insertError } = await supabase
      .from('employees')
      .insert({
        full_name: fullName,
        email,
        phone,
        address,
        designation,
        department,
        experience_years: experienceYears,
        photo_url: photoUrl,
        status: 'pending',
        ai_validation_score: aiScore,
        ai_summary: aiSummary,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit registration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
      employeeId: employee.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
