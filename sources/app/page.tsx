import {translateNode} from '@/lib/i18n/tree';
import {getLocale} from '@/lib/i18n/server';
import { HomePage } from './ui';
import { listExperiences } from '@/lib/content';
export const dynamic = 'force-dynamic';
export default async function Home(){const locale=await getLocale();const {items,unavailable}=await listExperiences();return translateNode(<HomePage items={items} unavailable={unavailable}/>,locale);}