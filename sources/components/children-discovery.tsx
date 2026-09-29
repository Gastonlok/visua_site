import {SectionHero} from '@/components/section-hero';
import Link from '@/components/site-link';
import {ArrowRight,HardHat,Sprout,Compass,Waves,TreePine,Building2} from 'lucide-react';
import {getLocale} from '@/lib/i18n/server';

const content={
 fr:{
  label:'LE COIN DES ENFANTS',back:'Retour',activity:'À toi de jouer',answer:'Découvrir la réponse',other:'Continuer la découverte',
  metiers:{title:'Les métiers, pour les enfants',intro:'Qui construit les maisons ? Qui fait pousser les aliments ? Découvre des métiers avec des mots simples et de petites activités.',other:'Explorer les territoires pour enfants',cards:[
   {icon:Sprout,title:'Faire pousser les aliments',text:'L’agriculteur ou l’agricultrice cultive la terre. Il ou elle prépare le sol, sème des graines et prend soin des plantes jusqu’à la récolte.',question:'Cite deux aliments qui poussent dans un champ ou un jardin.',answer:'Par exemple : le maïs et la tomate. Tu peux aussi penser au manioc ou à la carotte.'},
   {icon:HardHat,title:'Construire des maisons',text:'Le maçon ou la maçonne participe à la construction des bâtiments. Il ou elle assemble des matériaux pour réaliser des murs solides.',question:'Dessine une maison et entoure les murs, les portes et les fenêtres.',answer:'Les murs délimitent les pièces. Les portes permettent de passer et les fenêtres laissent entrer la lumière.'},
   {icon:Compass,title:'Faire découvrir un lieu',text:'Le guide ou la guide accompagne des visiteurs. Il ou elle leur présente un lieu, raconte son histoire et répond à leurs questions.',question:'Imagine que tu fais visiter ton quartier. Quel endroit aimerais-tu présenter ?',answer:'Il n’y a pas une seule bonne réponse : une place, un jardin, un bâtiment ou un autre lieu que tu connais. Explique ce qui te plaît dans cet endroit.'}
  ]},
  territoires:{title:'Les territoires, pour les enfants',intro:'Une rivière, une forêt, une ville : chaque lieu a quelque chose à te raconter. Observe, imagine et découvre le monde autour de toi.',other:'Explorer les métiers pour enfants',cards:[
   {icon:Waves,title:'Au fil de l’eau',text:'Une rivière est un cours d’eau. Sur ses rives, on peut observer des plantes, des animaux et parfois des villages ou des villes.',question:'Dessine une rivière et ajoute trois choses que tu imagines sur ses rives.',answer:'Tu peux dessiner des arbres, des maisons ou des oiseaux. Les paysages changent d’une rivière à l’autre.'},
   {icon:TreePine,title:'À la découverte de la forêt',text:'Une forêt est un espace où poussent de nombreux arbres. Des plantes et des animaux y vivent. On peut la découvrir en observant ses formes, ses couleurs et ses sons.',question:'Imagine une forêt. Quels sons pourrais-tu y entendre ?',answer:'Le chant des oiseaux, le vent dans les feuilles ou le bruit de la pluie sont quelques exemples.'},
   {icon:Building2,title:'Une ville à observer',text:'Dans une ville, on trouve des logements, des rues et des lieux où l’on apprend, travaille ou se retrouve. Chaque quartier a ses particularités.',question:'Dessine ton quartier idéal avec un lieu pour apprendre et un lieu pour jouer.',answer:'Tu peux ajouter une école ou une bibliothèque, puis un terrain de jeux ou un parc. À toi d’imaginer leur place !'}
  ]}
 },
 en:{
  label:'THE CHILDREN’S CORNER',back:'Back',activity:'Your turn',answer:'Discover the answer',other:'Keep exploring',
  metiers:{title:'Careers for children',intro:'Who builds houses? Who grows food? Discover careers through simple explanations and little activities.',other:'Explore places for children',cards:[
   {icon:Sprout,title:'Growing food',text:'Farmers work the land. They prepare the soil, sow seeds and take care of plants until harvest time.',question:'Name two foods that grow in a field or a garden.',answer:'For example: corn and tomatoes. You could also think of cassava or carrots.'},
   {icon:HardHat,title:'Building houses',text:'Bricklayers help build buildings. They put materials together to make strong walls.',question:'Draw a house and circle the walls, doors and windows.',answer:'Walls separate rooms. Doors let people pass through and windows let in light.'},
   {icon:Compass,title:'Showing people a place',text:'Guides accompany visitors. They introduce a place, tell its story and answer questions.',question:'Imagine giving a tour of your neighbourhood. Which place would you show?',answer:'There is no single right answer: a square, a garden, a building or another place you know. Explain what you like about it.'}
  ]},
  territoires:{title:'Places for children',intro:'A river, a forest, a city: every place has a story. Observe, imagine and discover the world around you.',other:'Explore careers for children',cards:[
   {icon:Waves,title:'Following the water',text:'A river is flowing water. Along its banks, you may see plants, animals and sometimes villages or cities.',question:'Draw a river and add three things you imagine along its banks.',answer:'You could draw trees, houses or birds. The scenery changes from one river to another.'},
   {icon:TreePine,title:'Discovering the forest',text:'A forest is a place where many trees grow. Plants and animals live there. You can discover it by observing its shapes, colours and sounds.',question:'Imagine a forest. What sounds might you hear?',answer:'Birdsong, wind in the leaves or the sound of rain are a few examples.'},
   {icon:Building2,title:'Looking at a city',text:'In a city, there are homes, streets and places to learn, work or meet. Every neighbourhood is different.',question:'Draw your ideal neighbourhood with a place to learn and a place to play.',answer:'You could add a school or a library, then a playground or a park. Imagine where they could go!'}
  ]}
 }
};

export async function ChildrenDiscovery({kind}:{kind:'metiers'|'territoires'}){
 const locale=await getLocale(),copy=content[locale],section=copy[kind];
 const parent=kind==='metiers'?'/metiers':'/destinations';
 const other=kind==='metiers'?'/destinations/enfants':'/metiers/enfants';
 return <main id="main" className="page-main children-page">
  <Link className="under-link" href={parent+'?lang='+locale}>{copy.back}</Link>
  <SectionHero locale={locale} title={section.title} description={section.intro} eyebrow={copy.label} image="/images/hero-enfants-vr.webp" alt={locale==='en'?'Two children discovering virtual reality with an educator':'Deux enfants découvrent la réalité virtuelle avec une éducatrice'} credit={locale==='en'?'AI-generated illustration':'Illustration générée par IA'} action={{label:copy.activity,href:'#activites'}}/>
  <div id="activites" className="card-grid">{section.cards.map(({icon:Icon,...card})=><article className="children-card" key={card.title}>
   <span className="children-icon"><Icon size={32} strokeWidth={1.5} aria-hidden="true"/></span><h2>{card.title}</h2><p>{card.text}</p>
   <div className="children-activity"><h3>{copy.activity}</h3><p>{card.question}</p><details><summary>{copy.answer}</summary><p>{card.answer}</p></details></div>
  </article>)}</div>
  <div className="catalogue-note"><p>{copy.other}</p><Link className="under-link" href={other+'?lang='+locale}>{section.other}<ArrowRight size={18} aria-hidden="true"/></Link></div>
 </main>;
}
