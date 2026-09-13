import CataloguePage from '../catalogue/catalogue-page';
import type { SearchParams } from '@/lib/catalogue-query';
import { pageMetadata } from '@/lib/seo';
import { getLocale } from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export async function generateMetadata(){return pageMetadata('/experiences','Toutes les découvertes','Fiches documentées et démonstrations immersives de VISUAA.',await getLocale())}
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}){return <CataloguePage params={await searchParams} path="/experiences"/>;}
