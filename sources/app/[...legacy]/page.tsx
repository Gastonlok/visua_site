import { notFound,permanentRedirect } from 'next/navigation';
import { getSettings,redirectDestination } from '@/lib/settings';
export const dynamic='force-dynamic';
export default async function Legacy({params}:{params:Promise<{legacy:string[]}>}){
 const path='/'+(await params).legacy.join('/'),target=redirectDestination(path,await getSettings());
 if(target)permanentRedirect(target);notFound();
}
