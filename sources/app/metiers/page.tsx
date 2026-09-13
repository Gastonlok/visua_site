import CataloguePage from '../catalogue/catalogue-page';
import type { SearchParams } from '@/lib/catalogue-query';
import { pageMetadata } from '@/lib/seo';
import { getLocale } from '@/lib/i18n/server';
export const dynamic='force-dynamic';
export async function generateMetadata(){return pageMetadata('/metiers','Les métiers','Découvrez les métiers des mines, de l’agriculture, du tourisme et de l’environnement.',await getLocale())}
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}){return <CataloguePage params={await searchParams} kind="metier" path="/metiers"/>;}
