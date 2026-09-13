import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';
import { publicPaths } from '@/lib/settings';
import { listContent } from '@/db/repository';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const pages=publicPaths.map(path=>({url:new URL(path,siteUrl()).toString()}));
 const items=await listContent();
 return [...pages,...items.map(e=>({url:new URL('/experiences/'+e.slug,siteUrl()).toString(),lastModified:e.updatedAt,alternates:{languages:{fr:new URL('/experiences/'+e.slug,siteUrl()).toString(),en:new URL('/experiences/'+e.slug+'?lang=en',siteUrl()).toString()}}}))];
}
