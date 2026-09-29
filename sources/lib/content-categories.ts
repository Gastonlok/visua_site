import type { Experience } from './models';

export type ContentCategory={id:string;label:string;group:string};

export const contentCategories:ContentCategory[]=[
 {id:'exploration',label:'Exploration et géosciences',group:'Mines'},
 {id:'extraction',label:'Extraction et conduite',group:'Mines'},
 {id:'traitement',label:'Traitement du minerai',group:'Mines'},
 {id:'maintenance',label:'Maintenance et énergie',group:'Mines'},
 {id:'securite',label:'Sécurité et environnement',group:'Mines'},
 {id:'logistique',label:'Logistique et encadrement',group:'Mines'},
 {id:'agri-cultures',label:'Cultures et horticulture',group:'Agriculture'},
 {id:'agri-elevage',label:'Élevage et apiculture',group:'Agriculture'},
 {id:'agri-peche',label:'Pêche et pisciculture',group:'Agriculture'},
 {id:'agri-agronomie',label:'Agronomie, conseil et recherche',group:'Agriculture'},
 {id:'agri-ressources',label:'Semences, sols et eau',group:'Agriculture'},
 {id:'agri-equipements',label:'Machinisme et équipements',group:'Agriculture'},
 {id:'agri-transformation',label:'Transformation et conservation',group:'Agriculture'},
 {id:'agri-gestion',label:'Commerce et gestion agricole',group:'Agriculture'},
 {id:'tour-hebergement',label:'Accueil et hébergement',group:'Tourisme'},
 {id:'tour-guides-patrimoine',label:'Guides et patrimoine',group:'Tourisme'},
 {id:'tour-voyages',label:'Agences et conception de voyages',group:'Tourisme'},
 {id:'tour-restauration',label:'Cuisine et restauration',group:'Tourisme'},
 {id:'tour-animation-evenementiel',label:'Animation et événementiel',group:'Tourisme'},
 {id:'tour-developpement-promotion',label:'Développement et promotion touristique',group:'Tourisme'},
 {id:'env-conservation',label:'Biodiversité et conservation',group:'Environnement'},
 {id:'env-forets',label:'Forêts et gestion forestière',group:'Environnement'},
 {id:'env-eau-assainissement',label:'Eau et assainissement',group:'Environnement'},
 {id:'env-dechets-recyclage',label:'Déchets, réemploi et recyclage',group:'Environnement'},
 {id:'env-pollution-hse',label:'Pollutions, hygiène et sécurité',group:'Environnement'},
 {id:'env-energie-climat',label:'Énergie et climat',group:'Environnement'},
 {id:'env-etudes-gouvernance',label:'Études et gouvernance environnementales',group:'Environnement'},
 {id:'btp-conception',label:'Conception et études',group:'BTP'},
 {id:'btp-gros-oeuvre',label:'Gros œuvre',group:'BTP'},
 {id:'btp-second-oeuvre',label:'Second œuvre',group:'BTP'},
 {id:'btp-travaux-publics',label:'Travaux publics',group:'BTP'},
 {id:'btp-equipements',label:'Équipements et maintenance',group:'BTP'},
 {id:'btp-securite-gestion',label:'Sécurité et gestion de chantier',group:'BTP'},
 {id:'parcs-reserves',label:'Parcs et réserves',group:'Territoires'},
 {id:'jardins',label:'Jardins botaniques',group:'Territoires'},
 {id:'eaux-paysages',label:'Eaux et paysages',group:'Territoires'},
 {id:'culture-musees',label:'Culture et musées',group:'Territoires'},
 {id:'patrimoine',label:'Villes et patrimoine',group:'Territoires'},
 {id:'projet-educatif',label:'Projet éducatif',group:'Projets'},
 {id:'projet-culturel',label:'Projet culturel',group:'Projets'},
 {id:'projet-entreprise',label:'Projet d’entreprise',group:'Projets'},
 {id:'demonstration-360',label:'Démonstration 360°',group:'Démonstrations'},
];

const domainGroups:Record<NonNullable<Experience['domain']>,string>={mines:'Mines',agriculture:'Agriculture',tourisme:'Tourisme',environnement:'Environnement',btp:'BTP',autre:'Autres'};

export function categoriesFor(kind:Experience['kind'],domain:Experience['domain']='autre'){
 const group=kind==='metier'?domainGroups[domain||'autre']:kind==='destination'?'Territoires':kind==='projet'?'Projets':'Démonstrations';
 return contentCategories.filter(category=>category.group===group);
}

export function categoryLabel(id?:string){return contentCategories.find(category=>category.id===id)?.label||id||'Sans catégorie'}
