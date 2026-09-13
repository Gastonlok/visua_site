import CataloguePage from './catalogue-page';
import type { SearchParams } from '@/lib/catalogue-query';
import { pageMetadata } from '@/lib/seo';
import { getLocale } from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export async function generateMetadata(){return pageMetadata('/catalogue','Catalogue des métiers et territoires','Explorez les métiers, territoires, projets et panoramas de VISUAA.',await getLocale())}
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}){return <CataloguePage params={await searchParams}/>;}
