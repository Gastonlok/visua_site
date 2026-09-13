import { notFound } from 'next/navigation';
import Link from '@/components/site-link';
import { getExperience } from '@/lib/content';
import { getLocale } from '@/lib/i18n/server';
import { translateNode } from '@/lib/i18n/tree';
import { t } from '@/lib/i18n/text';
import { pageMetadata,ficheJsonLd,safeJsonLd } from '@/lib/seo';
import Viewer from '@/app/viewer';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,e=await getExperience(slug);if(!e)return {title:'Fiche introuvable',robots:{index:false,follow:false}};
 return pageMetadata('/experiences/'+slug,e.seoTitle||e.title,e.seoDescription||e.description,await getLocale());
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,e=await getExperience(slug);if(!e)notFound();
 const locale=await getLocale(),contentLocale=locale==='en'&&t(e.body,'en')===e.body?'fr':locale;
 return translateNode(<main id="main" className="page-main"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJsonLd(ficheJsonLd(e,contentLocale))}}/>
 <nav className="bread" aria-label="Fil d’Ariane"><Link href="/catalogue">Catalogue</Link><span>/</span><span>{e.title}</span></nav>
 <div className="detail-head"><div><span className="eyebrow">{e.location}</span><h1>{e.title}</h1><div className="detail-badges"><span className="pill">{e.format==='text'?'Fiche à lire':e.format==='panorama'?'Panorama 360°':e.format==='video360'?'Vidéo 360°':'Vidéo classique'}</span><span className="pill">{e.duration}</span><span className="pill">{contentLocale==='en'?'English':'Français'}</span>{e.isDemo&&<span className="pill">Contenu pilote</span>}</div></div><p>{e.description}</p></div>
 {e.format==='text'?e.image&&<div className="detail-poster"><img src={e.image} alt={e.imageAlt||e.title} width="1200" height="500"/></div>:<Viewer experience={e}/>}
 {e.image&&<p className="credits-line">Image : {e.imageCredit} <a href={e.imageSource} target="_blank" rel="noreferrer">Source et droits</a></p>}
 <div className="detail-body"><article lang={contentLocale}><h2>{e.kind==='metier'?'Comprendre le métier':e.kind==='destination'?'Découvrir le territoire':'Découvrir cette expérience'}</h2>{contentLocale!==locale&&<p className="notice">This content is currently available in French.</p>}
 {e.body.split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}
 {e.skills.length>0&&<><h2>Les repères à retenir</h2><div className="detail-badges">{e.skills.map(s=><span key={s} className="pill">{s}</span>)}</div></>}
 {!!e.provinces?.length&&<section className="detail-provinces"><h2>Provinces</h2>{e.provinces.map(p=><Link className="province-link" key={p} href={'/destinations?province='+encodeURIComponent(p)}>{p}</Link>)}{e.provinceNote&&<p>{e.provinceNote}</p>}</section>}
 {!!e.sources?.length&&<section className="detail-sources"><h2>Pour approfondir</h2><ul>{e.sources.map((s,i)=><li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>{s.page&&' · '+s.page}</li>)}</ul></section>}
 {!!e.provinceSources?.length&&<section className="detail-sources"><h2>Références géographiques</h2><ul>{e.provinceSources.map((s,i)=><li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></section>}
 {e.format!=='text'&&<section id="alternative" className="detail-sources"><h2>Alternative textuelle</h2>{(e.transcript||e.body).split(/\n\s*\n/).map((p,i)=><p key={i}>{p}</p>)}<p className="small">Média : {e.mediaCredit}. <a href={e.mediaSource}>Source</a> · {e.capturedAt}</p></section>}
 </article><aside className="detail-aside"><span className="eyebrow">POUR VOTRE PUBLIC</span><h2>Prolongez la découverte.</h2><p>École, entreprise ou lieu culturel : préparons une démonstration adaptée à vos objectifs.</p><Link className="btn dark" href={'/contact?objet=demonstration&fiche='+encodeURIComponent(e.id)}>Demander une démonstration</Link><dl className="info-list"><div><dt>Accès</dt><dd>Gratuit</dd></div><div><dt>Casque</dt><dd>Non obligatoire</dd></div></dl>{e.format!=='text'&&<><p>Le média se charge à votre demande. La description reste disponible sans 3D.</p><a className="under-link" href="#alternative">Lire l’alternative textuelle</a><p className="small">Faites une pause au moindre inconfort. La compatibilité casque doit être validée sur l’appareil utilisé.</p></>}</aside></div></main>,locale);
}
