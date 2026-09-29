import {ChildrenDiscovery} from '@/components/children-discovery';
import {getLocale} from '@/lib/i18n/server';
import {pageMetadata} from '@/lib/seo';
export async function generateMetadata(){const locale=await getLocale();return pageMetadata('/destinations/enfants',locale==='en'?'Places for children':'Les territoires, pour les enfants',locale==='en'?'Explore rivers, forests and cities with activities for children.':'Explore les rivières, les forêts et les villes avec des activités pour enfants.',locale);}
export default function Page(){return <ChildrenDiscovery kind="territoires"/>;}
