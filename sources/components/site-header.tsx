'use client';

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,BriefcaseBusiness,ChevronDown,Compass,Globe2,HardHat,Home,Landmark,Leaf,Menu,Newspaper,Pickaxe,Sprout,UserRound,Users,Waves,X,Smile,type LucideIcon} from 'lucide-react';
import Link from './site-link';
import {VisuaLogo} from './visua-logo';
import {LanguageSwitch,useLocale} from './language-provider';
import {translateNode} from '@/lib/i18n/tree';

type Entry={label:string;href:string;icon:LucideIcon};
const sections:{label:string;href:string;icon:LucideIcon;description:string;items:Entry[]}[]=[
 {label:'Accueil',href:'/',icon:Home,description:'Un métier, un territoire, une nouvelle perspective.',items:[{label:'Découvrir VISUA',href:'/',icon:Home},{label:'Toutes les découvertes',href:'/catalogue',icon:Compass},{label:'Aide & confort VR',href:'/ressources',icon:Globe2}]},
 {label:'Les métiers',href:'/metiers',icon:BriefcaseBusiness,description:'Explorez les savoir-faire et trouvez votre voie.',items:[{label:'Mines',href:'/metiers?domaine=mines',icon:Pickaxe},{label:'Agriculture',href:'/metiers?domaine=agriculture',icon:Sprout},{label:'BTP',href:'/metiers?domaine=btp',icon:HardHat},{label:'Tourisme',href:'/metiers?domaine=tourisme',icon:Compass},{label:'Environnement',href:'/metiers?domaine=environnement',icon:Leaf},{label:'Enfants',href:'/metiers/enfants',icon:Smile},{label:'Tous les métiers',href:'/metiers',icon:BriefcaseBusiness}]},
 {label:'Les territoires',href:'/destinations',icon:Globe2,description:'Partez à la rencontre des paysages et des cultures de la RDC.',items:[{label:'Parcs et réserves',href:'/destinations?famille=parcs-reserves',icon:Leaf},{label:'Jardins botaniques',href:'/destinations?famille=jardins',icon:Sprout},{label:'Eaux et paysages',href:'/destinations?famille=eaux-paysages',icon:Waves},{label:'Culture et musées',href:'/destinations?famille=culture-musees',icon:Landmark},{label:'Villes et patrimoine',href:'/destinations?famille=patrimoine',icon:Home},{label:'Enfants',href:'/destinations/enfants',icon:Smile},{label:'Toutes les destinations',href:'/destinations',icon:Globe2}]},
 {label:'Actualité',href:'/actualite',icon:Newspaper,description:'Les nouvelles de VISUA et les découvertes à suivre.',items:[{label:'Toute l’actualité',href:'/actualite',icon:Newspaper},{label:'Actualité des métiers',href:'/actualite?theme=metiers',icon:BriefcaseBusiness},{label:'Actualité des territoires',href:'/actualite?theme=territoires',icon:Globe2}]},
 {label:'Qui sommes-nous',href:'/qui-sommes-nous',icon:Users,description:'Découvrez notre démarche et construisons la suite ensemble.',items:[{label:'Notre mission',href:'/qui-sommes-nous',icon:Users},{label:'Écoles & entreprises',href:'/organisations',icon:Landmark},{label:'Nos offres',href:'/offres',icon:Compass},{label:'Nous contacter',href:'/contact',icon:ArrowUpRight}]},
];

export function Header({brand='VISUAA'}:{brand?:string}){
 const locale=useLocale(),path=usePathname();
 const [active,setActive]=useState<number|null>(null),[mobile,setMobile]=useState(false);
 const root=useRef<HTMLElement>(null),triggers=useRef<(HTMLButtonElement|null)[]>([]);
 const section=active===null?null:sections[active];
 function close(restoreFocus=false){if(restoreFocus&&active!==null)triggers.current[active]?.focus();setActive(null);}
 useEffect(()=>{
  function outside(event:PointerEvent){if(!root.current?.contains(event.target as Node)){setActive(null);setMobile(false);}}
  document.addEventListener('pointerdown',outside);
  return ()=>document.removeEventListener('pointerdown',outside);
 },[]);
 return translateNode(<header ref={root} className="header editorial-header" onKeyDown={event=>{if(event.key==='Escape'){if(active!==null)close(true);else{setMobile(false);root.current?.querySelector<HTMLButtonElement>('.editorial-menu-toggle')?.focus();}}}} onBlur={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget)){setActive(null);setMobile(false);}}}>
  <div className="masthead">
   <Link href="/" className="brand official-brand" aria-label={brand+', accueil'}><VisuaLogo/></Link>
   <div className="masthead-signature"><span>Métiers & territoires de la RDC</span></div>
   <div className="header-actions"><LanguageSwitch/><Link className="account-link" href="/dashboard"><UserRound size={19}/><span>Mon espace</span></Link><button className="editorial-menu-toggle" aria-label={mobile?'Fermer le menu':'Ouvrir le menu'} aria-expanded={mobile} aria-controls="primary-navigation" onClick={()=>{setMobile(!mobile);setActive(null);}}>{mobile?<X/>:<Menu/>}</button></div>
  </div>
  <nav id="primary-navigation" className={'editorial-navigation'+(mobile?' is-open':'')} aria-label="Navigation principale">
   {sections.map((item,index)=>{const Icon=item.icon;return <button key={item.href} ref={node=>{triggers.current[index]=node;}} id={'nav-trigger-'+index} type="button" aria-expanded={active===index} aria-controls="navigation-panel" className={((path===item.href||(item.href!=='/'&&path.startsWith(item.href+'/')))?'is-current ':'')+(active===index?'is-expanded':'')} onClick={()=>setActive(active===index?null:index)}><Icon size={21} strokeWidth={1.6}/><span>{item.label}</span><ChevronDown className="nav-chevron" size={14}/></button>;})}
  </nav>
  <div id="navigation-panel" className="navigation-panel" hidden={!section}>
   {section&&<section aria-labelledby={'nav-trigger-'+active}>
    <div className="navigation-panel-heading"><div><Link href={section.href} onClick={()=>{close();setMobile(false);}}><section.icon size={26} strokeWidth={1.5}/>{section.label}<ArrowUpRight size={19}/></Link><p>{section.description}</p></div><button type="button" className="navigation-close" aria-label="Fermer le sous-menu" onClick={()=>close(true)}><X size={24}/></button></div>
    <div className="navigation-panel-grid">{section.items.map(item=><Link key={item.href} href={item.href} onClick={()=>{close();setMobile(false);}}><item.icon size={25} strokeWidth={1.5}/><span>{item.label}</span><ArrowUpRight className="navigation-item-arrow" size={16}/></Link>)}</div>
   </section>}
  </div>
 </header>,locale);
}
