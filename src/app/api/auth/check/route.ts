import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
type Attempt = { ip: string; email: string; time: string };
const attempts: Attempt[] = [];
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip =
    forwardedFor?.split(",")[0].trim() ||
    realIp ||
    "unknown";

  const attempt = {
    ip,
    email,
    time: new Date().toISOString(),
  };

  // เก็บล่าสุดแค่ 20 อันพอ array.unshift(item) → จะ เพิ่มค่าเข้าไปที่ต้น array และเลื่อน element เดิมไปทางขวาทั้งหมด
  attempts.unshift(attempt);
  if (attempts.length > 20) attempts.pop();
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

export async function GET() {
  return NextResponse.json({ ok: true, attempts });
}