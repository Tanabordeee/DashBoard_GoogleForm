import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
export async function GET(req: NextRequest) {
    const { data, error } = await supabaseAdmin
      .from("program_users")
      .select("id, username, enabled, created_at")
      .order("created_at", { ascending: true });
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ ok: true, users: data });
  }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Missing email or password" }, { status: 400 });
  }

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
    const { data: existingUser } = await supabaseAdmin
      .from("program_users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();

    if (existingUser) {
      return NextResponse.json({ ok: false, message: "User already exists" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user ใหม่
    const { data, error } = await supabaseAdmin
      .from("program_users")
      .insert([{ email, password_hash: hashedPassword }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    // ไม่ส่ง password กลับ
    const { password: _, ...userWithoutPassword } = data;

    return NextResponse.json({ ok: true, user: userWithoutPassword });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
