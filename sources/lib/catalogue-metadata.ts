import {translatedSearchTerms} from './i18n/text';
import type {Experience,ContentSource} from './models';
import provinceReference from './rdc-provinces.json' with {type:'json'};
import provinceMappings from './destination-provinces.json' with {type:'json'};
export const provinces=provinceReference.provinces;
export const domains=[{id:'mines',label:'Mines',description:'Exploration, extraction, traitement, maintenance et fonctions de soutien.'},{id:'agriculture',label:'Agriculture',description:'Productions végétales et animales, pêche, agronomie, équipements et filières alimentaires.'},{id:'tourisme',label:'Tourisme',description:'Accueil, hébergement, restauration, voyages, patrimoine et développement touristique.'},{id:'environnement',label:'Environnement',description:'Protection du vivant, eau, déchets, forêts, climat et qualité des milieux.'}] as const;
export function domainOf(e:Experience){if(e.kind!=='metier')return '';if(e.domain)return e.domain;const c=e.category||'';if(c.startsWith('agri-'))return 'agriculture';if(c.startsWith('tour-'))return 'tourisme';if(c.startsWith('env-'))return 'environnement';if(['exploration','extraction','traitement','maintenance','securite','logistique'].includes(c)||e.id==='geologue'||e.sector==='Mines & géosciences')return 'mines';return 'autre'}
export function domainLabel(e:Experience){return domains.find(d=>d.id===domainOf(e))?.label||'Autres métiers'}
type ProvinceMapping={id:string;provinces:string[];provinceNote?:string;sources?:ContentSource[]};
const mapping=new Map((provinceMappings as ProvinceMapping[]).map(p=>[p.id,p]));
export function withCatalogueMetadata(e:Experience):Experience{if(e.kind==='metier')return {...e,domain:domainOf(e) as Experience['domain']};if(e.kind!=='destination'||e.provinces!==undefined)return e;const p=mapping.get(e.id);return p?{...e,provinces:p.provinces,provinceNote:p.provinceNote||'',provinceSources:p.sources||[]}:e}
export function searchText(e:Experience){return [e.title,e.description,e.location,e.sector,domainLabel(e),...(e.skills||[]),...(e.provinces||[])].flatMap(text=>[text,translatedSearchTerms(text)]).join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function provinceMatches(e:Experience,province:string){return province==='all'||(e.provinces||[]).includes(province)}
