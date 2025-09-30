import { SignJWT, importJWK } from 'jose';
import { cookies } from 'next/headers';
export async function POST(req: Request) {
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

      const cookieStore = await cookies();
      cookieStore.set('token', token);

      return new Response(JSON.stringify({ message: token }), { status: 200 });
    } else {
      throw new Error('Login failed');
    }
  } catch(error){
    return new Response(JSON.stringify({ message: 'Login failed',err : error }), { status: 401 });
  }
};