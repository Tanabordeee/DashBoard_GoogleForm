import { jwtVerify, importJWK } from "jose";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
    try {
      const pathname = req.nextUrl.pathname;
      const method = req.method;
      let token = req.cookies.get("token");
      if (
        (pathname === "/api/blog" && ["POST", "PUT", "DELETE"].includes(method)) ||
        (pathname === "/manage/product" && method === "GET") ||
        (pathname === "/manage/blogcreate" && method === "GET") ||
        (pathname === "/manage/blogs" && method === "GET") ||
        (pathname.startsWith("/manage/blogupdate/") && method === "GET") 
      ){
        if (!token) {
          return new NextResponse("Token is missing", { status: 401 });
        }
        const secretJWK = {
          kty: 'oct',  
          k: process.env.JOSE_SECRET as string
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
      
      return new NextResponse("Method not allowed", { status: 405 });
    } catch (error: any) {
      return new NextResponse("Error: Invalid token", { status: 403 });
    }
}

export const config = {
  matcher: ['/manage/product' , "/api/blog" , "/manage/blogcreate" , "/manage/blogs" , "/manage/blogupdate" , "/api/product"],
};