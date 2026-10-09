import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const queryToken = request.nextUrl.searchParams.get('access_token')
  const cookieToken = request.cookies.get('jdih_access')?.value

  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)
  ) {
    return NextResponse.next()
  }

  if (queryToken === process.env.WEBSITE_ACCESS_TOKEN) {
    const url = new URL(request.url)
    url.searchParams.delete('access_token')

    const response = NextResponse.redirect(url)

    response.cookies.set('jdih_access', 'granted', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1, // 1 hari
    })

    return response
  }

  const hasValidCookie = cookieToken === 'granted'

  if (!hasValidCookie) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akses Ditolak - JARINGAN DOKUMENTASI DAN INFORMASI HUKUM</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    :root {
      --primary: #0b29c2;
      --primary-light: #e6eaff;
      --text-dark: #1e293b;
      --text-light: #64748b;
      --danger: #ef4444;
      --danger-light: #fef2f2;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: var(--text-dark);
    }

    .container {
      background: white;
      padding: 3rem 3rem;
      border-radius: 1.5rem;
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.05),
        0 8px 10px -6px rgba(0, 0, 0, 0.01);
      max-width: 450px;
      width: 85%;
      text-align: center;
      border-top: 6px solid var(--primary);
    }

    .icon-container {
      width: 72px;
      height: 72px;
      background-color: var(--danger-light);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 1.5rem;
    }

    .icon-container svg {
      width: 32px;
      height: 32px;
      color: var(--danger);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.75rem;
      color: var(--text-dark);
      letter-spacing: -0.025em;
    }

    p {
      color: var(--text-light);
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 1.5rem;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .hospital-name {
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.05em;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="icon-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    <h1>Area Terbatas</h1>

    <p>
      Anda mencoba mengakses halaman internal JDIH.
      Silakan masuk menggunakan akun yang memiliki hak akses
      untuk melanjutkan.
    </p>

    <div class="footer">
      Sistem Terpadu &bull;
      <span class="hospital-name">
        JARINGAN DOKUMENTASI DAN INFORMASI HUKUM
      </span>
    </div>
  </div>
</body>
</html>`,
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    )
  }

  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function proxy(request: NextRequest) {
//   const { pathname, searchParams } = request.nextUrl;

//   /**
//    * ============================================
//    * 1. BYPASS STATIC / API
//    * ============================================
//    */
//   if (
//     pathname.startsWith("/api") ||
//     pathname.startsWith("/_next") ||
//     pathname === "/favicon.ico" ||
//     /\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|map|woff|woff2|ttf)$/i.test(
//       pathname,
//     )
//   ) {
//     return NextResponse.next();
//   }

//   /**
//    * ============================================
//    * 2. LOGIN / ADMIN AUTHENTICATION
//    * ============================================
//    */

//   const isLoginPage = pathname === "/auth";
//   const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

//   /**
//    * Token login ADMIN
//    *
//    * Pastikan login menyimpan token dengan nama:
//    *
//    * access_token
//    */
//   const accessToken =
//     request.cookies.get("access_token")?.value;

//   /**
//    * ============================================
//    * 3. SUDAH LOGIN
//    * ============================================
//    *
//    * Kalau user sudah login dan membuka /auth,
//    * jangan tampilkan login lagi.
//    *
//    * Langsung masuk dashboard.
//    */
//   if (isLoginPage && accessToken) {
//     return NextResponse.redirect(
//       new URL("/admin/dashboard", request.url),
//     );
//   }

//   /**
//    * ============================================
//    * 4. ADMIN BELUM LOGIN
//    * ============================================
//    *
//    * Semua /admin harus memiliki access_token.
//    */
//   if (isAdminPage && !accessToken) {
//     return NextResponse.redirect(
//       new URL("/auth", request.url),
//     );
//   }

//   /**
//    * ============================================
//    * 5. WEBSITE ACCESS
//    * ============================================
//    *
//    * jdih_access digunakan untuk membatasi
//    * website production.
//    *
//    * TIDAK digunakan untuk /auth dan /admin.
//    */
//   const queryToken =
//     searchParams.get("access_token");

//   const websiteCookie =
//     request.cookies.get("jdih_access")?.value;

//   /**
//    * Jika URL mempunyai access_token website
//    * yang valid, simpan cookie.
//    *
//    * Contoh:
//    *
//    * https://jdih.asiasistem.com/?access_token=XXXX
//    */
//   if (
//     queryToken &&
//     queryToken === process.env.WEBSITE_ACCESS_TOKEN
//   ) {
//     const url = request.nextUrl.clone();

//     url.searchParams.delete("access_token");

//     const response = NextResponse.redirect(url);

//     response.cookies.set("jdih_access", "granted", {
//       path: "/",
//       httpOnly: true,
//       secure: true,
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 7,
//     });

//     return response;
//   }

//   /**
//    * ============================================
//    * 6. /AUTH SELALU BOLEH DIAKSES
//    * ============================================
//    *
//    * Jangan terkena jdih_access.
//    */
//   if (isLoginPage) {
//     return NextResponse.next();
//   }

//   /**
//    * ============================================
//    * 7. ADMIN SELALU BOLEH LANJUT
//    * JIKA SUDAH LOGIN
//    * ============================================
//    */
//   if (isAdminPage && accessToken) {
//     const response = NextResponse.next();

//     response.headers.set(
//       "X-Frame-Options",
//       "DENY",
//     );

//     response.headers.set(
//       "X-Robots-Tag",
//       "noindex, nofollow",
//     );

//     return response;
//   }

//   /**
//    * ============================================
//    * 8. WEBSITE PUBLIC
//    * ============================================
//    *
//    * Halaman selain /auth dan /admin membutuhkan
//    * jdih_access.
//    */
//   if (websiteCookie !== "granted") {
//     return new NextResponse(
//       `<!DOCTYPE html>
// <html lang="id">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Akses Ditolak - JDIH</title>
//   <meta name="robots" content="noindex, nofollow">

//   <style>
//     body {
//       font-family: Inter, system-ui, sans-serif;
//       display: flex;
//       justify-content: center;
//       align-items: center;
//       min-height: 100vh;
//       margin: 0;
//       background: #f8fafc;
//     }

//     .container {
//       background: white;
//       padding: 3rem;
//       border-radius: 1.5rem;
//       box-shadow: 0 20px 25px rgba(0,0,0,.05);
//       max-width: 450px;
//       width: 85%;
//       text-align: center;
//     }

//     h1 {
//       color: #1e293b;
//     }

//     p {
//       color: #64748b;
//       line-height: 1.6;
//     }
//   </style>
// </head>

// <body>
//   <div class="container">
//     <h1>Area Terbatas</h1>

//     <p>
//       Anda mencoba mengakses halaman internal JDIH.
//       Silakan gunakan akses yang valid untuk melanjutkan.
//     </p>
//   </div>
// </body>
// </html>`,
//       {
//         status: 403,
//         headers: {
//           "Content-Type": "text/html; charset=utf-8",
//           "X-Robots-Tag": "noindex, nofollow",
//         },
//       },
//     );
//   }

//   /**
//    * ============================================
//    * 9. REQUEST NORMAL
//    * ============================================
//    */

//   const response = NextResponse.next();

//   response.headers.set(
//     "X-Frame-Options",
//     "DENY",
//   );

//   response.headers.set(
//     "X-Robots-Tag",
//     "noindex, nofollow",
//   );

//   return response;
// }

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico).*)",
//   ],
// };