import { siteUrl,isPublic } from '@/lib/config';
export const dynamic='force-dynamic';
export default function robots(){return {rules:isPublic()?{userAgent:'*',allow:'/',disallow:['/api/','/dashboard','/admin','/connexion','/inscription']}:{userAgent:'*',disallow:'/'},sitemap:new URL('/sitemap.xml',siteUrl()).toString()}}
