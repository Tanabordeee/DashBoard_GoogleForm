import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ ok: false, message: "Missing email or password" }, { status: 400 });

  try {
    // ดึง user ตาม email
    const { data, error } = await supabaseAdmin
      .from("program_users")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();

    if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ ok: false, message: "User not found" }, { status: 404 });

    // ตรวจสอบ password กับ hash
    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) return NextResponse.json({ ok: false, message: "Invalid password" }, { status: 401 });
    if(!data.enabled){
        return NextResponse.json({ok:false , message:"YOUR ACCOUNT HAS DISABLE"})
    }
    // สร้าง token ตัวอย่างง่าย ๆ
    const token = Buffer.from(`${data.id}:${data.email}`).toString("base64");

    // ไม่ส่ง password hash กลับ
    const { password_hash: _, ...userWithoutPassword } = data;

    return NextResponse.json({ ok: true, user: userWithoutPassword, token });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
