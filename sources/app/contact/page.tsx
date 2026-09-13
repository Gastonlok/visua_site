import ContactForm from '../contact-form';
import { pageMetadata } from '@/lib/seo';
import { getLocale } from '@/lib/i18n/server';
export async function generateMetadata(){return pageMetadata('/contact','Parlons de votre projet','Préparez une démonstration VISUAA pour votre école, votre entreprise ou votre lieu culturel.',await getLocale())}
export default async function Page({searchParams}:{searchParams:Promise<{objet?:string;fiche?:string}>}){
 const p=await searchParams,intent=['demonstration','devis','partenariat','assistance','signalement'].includes(p.objet||'')?p.objet:'demonstration';
 return <ContactForm initialIntent={intent} ficheId={p.fiche||''}/>;
}
