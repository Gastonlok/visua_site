import type {Experience} from './models';
import {withCatalogueMetadata} from './catalogue-metadata';
import additional from './additional-careers.json' with {type:'json'};
import {seed as legacySeed} from './legacy-seed';
import mining from './mining-careers.json' with {type:'json'};
import anapi from './anapi-destinations.json' with {type:'json'};
const common={kind:'metier',format:'text',image:'',imageCredit:'',imageSource:'',imageAlt:'',duration:'2 min de lecture',mediaUrl:'',mediaCredit:'',mediaSource:'',capturedAt:'Sans captation',transcript:'',points:[],status:'published',isDemo:true,rightsConfirmed:false,version:1,updatedAt:'2026-09-12'} as const;
const careers:Experience[]=mining.careers.map(c=>({...common,...c,kind:'metier',format:'text',points:[],location:c.environment+' · Secteur minier',body:c.body,transcript:''}));
const destinations:Experience[]=anapi.map(d=>{const old=legacySeed.find(e=>e.id===d.id);return {...common,...d,kind:'destination',format:'text',points:[],...(d.preserveExistingImage&&old?{image:old.image,imageCredit:old.imageCredit,imageSource:old.imageSource,imageAlt:'Vue de Kinshasa, photographie de 2007'}:{})}});
const newCareers:Experience[]=additional.careers.map(c=>({...common,...c,domain:c.domain as Experience['domain'],kind:'metier',format:'text',points:[],location:c.environment,body:c.body,transcript:''}));
const additions:Experience[]=[...careers,...destinations,...newCareers].map(withCatalogueMetadata);
export const seed:Experience[]=[...legacySeed.map(e=>additions.find(a=>a.id===e.id)||e),...additions.filter(e=>!legacySeed.some(old=>old.id===e.id))];
// Upgrade only the exact untouched original editorial fixtures. Never overwrite administrator edits.
export const seedRevisions=legacySeed.filter(old=>additions.some(e=>e.id===old.id)).map(old=>({before:old,after:additions.find(e=>e.id===old.id)!}));
