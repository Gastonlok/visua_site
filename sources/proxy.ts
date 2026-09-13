import { NextResponse,type NextRequest } from 'next/server';
import { resolveLocale,isLocale,localeCookie } from './lib/i18n/locale';
export function proxy(request:NextRequest) {
 const requested=request.nextUrl.searchParams.get('lang'),locale=resolveLocale(requested,request.cookies.get(localeCookie)?.value);
 const forwarded=new Headers(request.headers);
 for(const key of [...forwarded.keys()])if(key.startsWith('oai-authenticated-user-'))forwarded.delete(key);
 forwarded.set('x-visua-locale',locale);forwarded.set('x-visua-path',request.nextUrl.pathname+request.nextUrl.search);
 const response=NextResponse.next({request:{headers:forwarded}});
 if(isLocale(requested))response.cookies.set(localeCookie,locale,{path:'/',maxAge:31536000,sameSite:'lax',httpOnly:true,secure:request.nextUrl.protocol==='https:'});
 response.headers.set('Content-Language',locale);
 if(/^\/(api|admin|dashboard|connexion|inscription)(\/|$)/.test(request.nextUrl.pathname)){
  response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');
 }else if(process.env.SITE_PUBLIC!=='true')response.headers.set('X-Robots-Tag','noindex, nofollow');
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('X-Frame-Options','DENY');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)');
 response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'"+(process.env.NODE_ENV==='development'?" 'unsafe-eval'":"")+"; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https:"+(process.env.NODE_ENV==='development'?' ws:':'')+"; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|images/|documents/).*)']};
