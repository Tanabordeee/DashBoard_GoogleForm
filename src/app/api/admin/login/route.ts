import { SignJWT, importJWK } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const { email , password} = await req.json();
    if (email === process.env.NEXT_PUBLIC_EMAIL && password === process.env.NEXT_PUBLIC_PASSWORD) {
      const secretJWK = {
        kty: 'oct',
        k: process.env.JOSE_SECRET
      };
      const secretKey = await importJWK(secretJWK, 'HS256');
      const token = await new SignJWT({ name: process.env.NEXT_PUBLIC_EMAIL })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secretKey);

        const res = NextResponse.json({ token }, { status: 200 });
        res.cookies.set({
          name: 'token',
          value: token,
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60,
        });
  
        return res;
    } else {
      throw new Error('Login failed');
    }
  } catch(error){
    return NextResponse.json({ message: 'Login failed',err : error }, { status: 401 });
  }
};