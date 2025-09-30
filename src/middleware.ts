import { jwtVerify, importJWK } from "jose";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
    try {
      const pathname = req.nextUrl.pathname;
      
      if (pathname.startsWith("/api/admin/users") || pathname.startsWith("/admin/users")) {
        const token = req.cookies.get("token");
        
        if (!token) {
          return NextResponse.redirect(new URL('/', req.url));
        }
        
        if (!process.env.JOSE_SECRET) {
          return new NextResponse("Server configuration error", { status: 500 });
        }
        
        const secretJWK = {
          kty: 'oct',  
          k: process.env.JOSE_SECRET
        };
        const secretKey = await importJWK(secretJWK, 'HS256');
        const { payload } = await jwtVerify(token.value, secretKey);
        
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('user', JSON.stringify({ name: payload.name }));
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
      
      return NextResponse.next();
    } catch (error: any) {
      console.log("Middleware error:", error.message);
      return NextResponse.redirect(new URL('/', req.url));
    }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};


