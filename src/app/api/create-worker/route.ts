import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, job_title, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }

    // Use service role key to create users server-side
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create the auth user
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'worker', job_title },
    });

    if (userError) return NextResponse.json({ error: userError.message }, { status: 400 });

    // Upsert profile
    const { error: profileError } = await admin.from('profiles').upsert({
      id:        userData.user.id,
      name,
      role:      'worker',
      job_title: job_title || null,
      phone:     phone     || null,
      available: true,
    });

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    return NextResponse.json({ success: true, userId: userData.user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
