import {SectionHero} from '@/components/section-hero';
import {queryValue,type SearchParams} from '@/lib/catalogue-query';
import Link from '@/components/site-link';
import {BriefcaseBusiness,Globe2,ArrowUpRight} from 'lucide-react';
import {getLocale} from '@/lib/i18n/server';
import {translateNode} from '@/lib/i18n/tree';
import {pageMetadata} from '@/lib/seo';

export async function generateMetadata(){return pageMetadata('/actualite','Actualité','Suivez les nouvelles de VISUA, des métiers et des territoires de la RDC.',await getLocale());}
export default async function Page({searchParams}:{searchParams:Promise<SearchParams>}){
 const locale=await getLocale();
 const topic=queryValue(await searchParams,'theme'),careers=topic==='metiers',places=topic==='territoires';
 return translateNode(<main id="main" className="page-main">
  <SectionHero locale={locale} eyebrow="LE JOURNAL VISUA" title={careers?'Actualité des métiers':places?'Actualité des territoires':'Actualité'} description={careers?'Les savoir-faire et les parcours professionnels à suivre.':places?'Les paysages, les cultures et le patrimoine à découvrir.':'Les nouvelles de VISUA, des métiers et des territoires de la RDC.'} image={careers?'/images/hero-btp.webp':places?'/images/hero.webp':'/images/kinshasa.webp'} alt={careers?'Deux professionnels du bâtiment examinent des plans sur un chantier':places?'La rivière Lukenie au milieu de la forêt en RDC':'Kinshasa et ses espaces verts'} credit={careers?'Illustration générée par IA':places?'Rivière Lukenie · Valerius Tygart':'Kinshasa · Irene2005'}/>
  <div className="notice"><h2>Les premières actualités arrivent bientôt.</h2><p>Aucune actualité n’est publiée pour le moment. En attendant, explorez les métiers et les territoires du catalogue.</p></div>
  <div className="news-topics">
   <article id="metiers"><BriefcaseBusiness size={30} strokeWidth={1.5}/><h2>Du côté des métiers</h2><p>Découvrez les domaines professionnels et les savoir-faire présentés sur VISUA.</p><Link href="/metiers" className="under-link">Explorer les métiers<ArrowUpRight size={18}/></Link></article>
   <article id="territoires"><Globe2 size={30} strokeWidth={1.5}/><h2>Du côté des territoires</h2><p>Parcourez les destinations, les paysages et le patrimoine de la RDC.</p><Link href="/destinations" className="under-link">Explorer les territoires<ArrowUpRight size={18}/></Link></article>
  </div>
 </main>,locale);
}
