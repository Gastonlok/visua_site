import {headers} from 'next/headers';import {isLocale,resolveLocale,localeCookie} from './locale';
export async function getLanguageContext(){const h=await headers();const forwarded=h.get('x-visua-locale');const cookie=h.get('cookie')?.split(';').map(p=>p.trim()).find(p=>p.startsWith(localeCookie+'='))?.slice(localeCookie.length+1);return {locale:isLocale(forwarded)?forwarded:resolveLocale(null,cookie),path:h.get('x-visua-path')||'/'};}
export async function getLocale(){return (await getLanguageContext()).locale}
