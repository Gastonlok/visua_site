import Image from 'next/image';
import Link from '@/components/site-link';
import {ArrowDown} from 'lucide-react';
import {translateNode} from '@/lib/i18n/tree';
import type {Locale} from '@/lib/i18n/locale';

export type HeroContent={title:string;description:string;image:string;alt:string;eyebrow?:string;credit?:string};

export function SectionHero({title,description,image,alt,eyebrow,credit,locale='fr',action}:{
  locale?:Locale;action?:{label:string;href:string};
}&HeroContent){
 return translateNode(<section className="catalogue-hero section-hero" aria-label={title}>
  <Image className="catalogue-hero-image" src={image} alt={alt} fill sizes="(max-width: 1440px) 88vw, 1262px" preload/>
  <div className="catalogue-hero-shade" aria-hidden="true"/>
  <div className="catalogue-hero-copy">
   {eyebrow&&<span className="eyebrow">{eyebrow}</span>}
   <h1>{title}</h1><p>{description}</p>
   {action&&<Link className="btn catalogue-hero-action" href={action.href}>{action.label}<ArrowDown size={18} aria-hidden="true"/></Link>}
  </div>
  {credit&&<p className="catalogue-hero-credit">{credit} · <Link href="/credits">Crédits</Link></p>}
 </section>,locale);
}
