import {ChildrenDiscovery} from '@/components/children-discovery';
import {getLocale} from '@/lib/i18n/server';
import {pageMetadata} from '@/lib/seo';
export async function generateMetadata(){const locale=await getLocale();return pageMetadata('/metiers/enfants',locale==='en'?'Careers for children':'Les métiers, pour les enfants',locale==='en'?'Discover careers with simple explanations and activities for children.':'Découvre les métiers avec des explications simples et des activités pour enfants.',locale);}
export default function Page(){return <ChildrenDiscovery kind="metiers"/>;}
