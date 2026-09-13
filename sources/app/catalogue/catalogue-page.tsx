import Link from '@/components/site-link';
import { Card,Unavailable } from '@/app/ui';
import { listExperiences } from '@/lib/content';
import { getLocale } from '@/lib/i18n/server';
import { translateNode } from '@/lib/i18n/tree';
import { domains,provinces,domainOf } from '@/lib/catalogue-metadata';
import {Pickaxe,Sprout,Compass,Leaf} from 'lucide-react';
import { filterCatalogue,queryValue,type SearchParams } from '@/lib/catalogue-query';
export default async function CataloguePage({params,kind='all',path='/catalogue'}:{params:SearchParams;kind?:string;path?:string}){
 const locale=await getLocale(),result=await listExperiences();
 const filtered=filterCatalogue(result.items,kind==='metier'?{...params,type:'metier'}:params,kind);
 const careers=result.items.filter(e=>e.kind==='metier');
 const activeDomain=queryValue(params,'domaine');
 const domainIcons={mines:Pickaxe,agriculture:Sprout,tourisme:Compass,environnement:Leaf};
 const domainHref=(domain:string)=>{const q=new URLSearchParams();for(const [key,value]of Object.entries(params))if(typeof value==='string'&&!['page','domaine','famille','type'].includes(key))q.set(key,value);q.set('lang',locale);if(domain)q.set('domaine',domain);return path+'?'+q.toString()};
 const title=kind==='metier'?'Découvrez les métiers.':kind==='destination'?'Découvrez les territoires.':'Toutes les découvertes.';
 const visual=kind==='metier'?{src:'/images/metier.webp',alt:'Engins au travail dans une carrière près de Goma',caption:'Carrière près de Goma · MONUSCO / Abel Kavanagh'}:kind==='destination'?{src:'/images/kinshasa.webp',alt:'Vue sur les immeubles et les espaces verts de Kinshasa',caption:'Kinshasa · Irene2005'}:{src:'/images/hero.webp',alt:'La rivière Lukenie au milieu de la forêt en RDC',caption:'Rivière Lukenie · Valerius Tygart'};
 const pagination=(page:number)=>{const q=new URLSearchParams();for(const [key,value]of Object.entries(params))if(typeof value==='string')q.set(key,value);q.set('page',String(page));q.set('lang',locale);return path+'?'+q.toString()};
 return translateNode(<main id="main" className="page-main catalogue-page">{kind==='metier'?<section className="careers-opening"><span className="eyebrow">MÉTIERS & SAVOIR-FAIRE</span><h1>Découvrez les métiers.<br/><em>Choisissez votre domaine.</em></h1><p>Mines, agriculture, tourisme et environnement : explorez les missions, les savoir-faire et les environnements de travail.</p><nav className="career-domain-nav" aria-label="Domaines des métiers"><Link href={domainHref('')} aria-current={!activeDomain||activeDomain==='all'?'page':undefined}>Tous les métiers <span>{result.unavailable?'—':careers.length}</span></Link>{domains.map(d=>{const Icon=domainIcons[d.id];return <Link key={d.id} href={domainHref(d.id)} aria-current={activeDomain===d.id?'page':undefined}><Icon size={19} aria-hidden="true"/>{d.label}<span>{result.unavailable?'—':careers.filter(e=>domainOf(e)===d.id).length}</span></Link>})}</nav></section>:<div className="catalogue-opening"><div className="page-intro"><span className="eyebrow">MÉTIERS · TERRITOIRES · PROJETS</span><h1>{title}</h1><p>Des fiches documentées pour découvrir la RDC et une démonstration pour essayer le panorama 360°.</p></div><figure className="catalogue-photo"><img src={visual.src} alt={visual.alt} width="900" height="600"/><figcaption>{visual.caption} · <Link href="/credits">Crédits</Link></figcaption></figure></div>}
 <form className="public-filters" method="get" action={path}>
 <input type="hidden" name="lang" value={locale}/>
 <label>Rechercher<input name="q" defaultValue={queryValue(params,'q')} maxLength={200} placeholder="Un métier, un lieu, une compétence…"/></label>
 {kind==='metier'?<input type="hidden" name="type" value="metier"/>:<label>Type<select name="type" defaultValue={queryValue(params,'type')||kind}><option value="all">Tous les types</option><option value="metier">Métier</option><option value="destination">Territoire</option><option value="projet">Projet</option><option value="demo">Démonstration</option></select></label>}
 <label>Province<select name="province" defaultValue={queryValue(params,'province')}><option value="">Toutes les provinces</option>{provinces.map(p=><option key={p}>{p}</option>)}</select></label>
 <label>Domaine<select name="domaine" defaultValue={queryValue(params,'domaine')}><option value="">Tous les domaines</option>{domains.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
 <label>Format<select name="format" defaultValue={queryValue(params,'format')}><option value="">Tous les formats</option><option value="text">Fiche à lire</option><option value="panorama">Panorama 360°</option><option value="video360">Vidéo 360°</option><option value="video">Vidéo classique</option></select></label>
 <button className="btn dark" type="submit">Filtrer</button><Link className="under-link" href={path}>Réinitialiser</Link>
 </form>
 {result.unavailable?<Unavailable/>:<><p className="catalogue-summary" role="status">{filtered.total} {locale==='en'?'results':'résultats'}</p>
 {!filtered.total?<div className="notice"><h2>Aucun résultat</h2><p>Essayez un autre mot-clé ou élargissez les filtres.</p></div>:<div className="card-grid">{filtered.items.map(e=><Card key={e.id} item={e}/>)}</div>}
 <nav className="pagination" aria-label="Pagination">{filtered.page>1&&<Link className="btn dark" href={pagination(filtered.page-1)}>Précédent</Link>}<span>Page {filtered.page} / {filtered.pages}</span>{filtered.page<filtered.pages&&<Link className="btn dark" href={pagination(filtered.page+1)}>Suivant</Link>}</nav></>}
 <div className="catalogue-note"><p>Un métier à faire découvrir ou un territoire à valoriser ?</p><Link className="under-link" href="/contact">Parlons de votre projet</Link></div>
 </main>,locale);
}
