'use client';
import Link from '@/components/site-link';
import {useLocale} from '@/components/language-provider';
import {translateNode} from '@/lib/i18n/tree';

export function DiscoveryGallery(){
 const locale=useLocale();return translateNode(<section className="section photo-discovery"><div className="section-heading"><div><span className="eyebrow">LA RDC EN IMAGES</span><h2>Des lieux à explorer.<br/>Des métiers à comprendre.</h2></div><Link className="under-link" href="/catalogue">Ouvrir le catalogue ↗</Link></div><div className="photo-grid">
 <Link href="/destinations" className="photo-tile photo-tile-wide"><img src="/images/hero.webp" alt="Vue aérienne de la rivière Lukenie au milieu de la forêt en RDC" width="1800" height="1350" loading="lazy"/><span><small>PAYSAGES & BIODIVERSITÉ</small><strong>Suivre le fil de la découverte.</strong><em>Rivière Lukenie · RDC</em></span></Link>
 <Link href="/metiers" className="photo-tile"><img src="/images/metier.webp" alt="Engins et parois rocheuses dans une carrière près de Goma" width="780" height="520" loading="lazy"/><span><small>MÉTIERS & SAVOIR-FAIRE</small><strong>Voir le travail autrement.</strong><em>Carrière près de Goma · Nord-Kivu</em></span></Link>
 <Link href="/destinations" className="photo-tile"><img src="/images/kinshasa.webp" alt="Vue sur Kinshasa, ses immeubles et ses espaces verts" width="780" height="520" loading="lazy"/><span><small>VILLES & TERRITOIRES</small><strong>Changer de perspective.</strong><em>Kinshasa · RDC</em></span></Link>
 </div><p className="photo-credits">Photographies : Valerius Tygart · MONUSCO / Abel Kavanagh · Irene2005. <Link href="/credits">Crédits et licences</Link></p></section>,locale);
}
