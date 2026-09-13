import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/language-provider';
import { getLanguageContext } from '@/lib/i18n/server';
import { t } from '@/lib/i18n/text';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import { siteUrl,isPublic } from '@/lib/config';
import './globals.css';
import { Header,Footer } from './ui';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const {locale,path}=await getLanguageContext(),settings=await getSettings();
 return {...pageMetadata(path.split('?')[0],settings.seoTitle,settings.seoDescription,locale),metadataBase:new URL(siteUrl()),title:{default:settings.seoTitle,template:'%s | '+settings.brand},icons:{icon:'/favicon.svg'}};
}
export default async function RootLayout({children}:{children:React.ReactNode}){
 const {locale,path}=await getLanguageContext();const settings=await getSettings();
 const pathname=path.split('?')[0],workspace=pathname==='/dashboard'||pathname.startsWith('/dashboard/')||pathname==='/admin'||pathname.startsWith('/admin/');
 return <html lang={locale}><body><LanguageProvider locale={locale} path={path}><a className="skip" href="#main">{t('Aller au contenu',locale)}</a>{!workspace&&<Header preview={!isPublic()} brand={settings.brand}/ >}{children}{!workspace&&<Footer brand={settings.brand}/>}</LanguageProvider></body></html>;
}

import './workspace.css';
