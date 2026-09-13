import type { Metadata } from 'next';
import { siteUrl,isPublic } from './config';
import { publicPaths } from './settings';
import type { Experience } from './models';
import { t } from './i18n/text';
import type { Locale } from './i18n/locale';
export function pageMetadata(path:string,title:string,description:string,locale:Locale='fr'):Metadata{
 const url=new URL(path,siteUrl());if(locale==='en')url.searchParams.set('lang','en');
 const canonical=url.toString();
 return {title:t(title,locale),description:t(description,locale),alternates:{canonical,languages:{fr:new URL(path,siteUrl()).toString(),en:new URL(path+(path.includes('?')?'&':'?')+'lang=en',siteUrl()).toString()}},
 robots:{index:isPublic(),follow:true},openGraph:{type:'website',url:canonical,title:t(title,locale),description:t(description,locale),locale:locale==='en'?'en_GB':'fr_CD',siteName:'VISUAA',images:[{url:new URL('/images/congovr-hero.png',siteUrl()).toString(),width:2172,height:724,alt:'VISUAA — métiers et territoires'}]},
 twitter:{card:'summary_large_image',title:t(title,locale),description:t(description,locale)}};
}
export function ficheJsonLd(e:Experience,locale:Locale='fr'){
 return {'@context':'https://schema.org','@type':'Article',headline:t(e.title,locale),description:t(e.description,locale),
 url:new URL('/experiences/'+e.slug+(locale==='en'?'?lang=en':''),siteUrl()).toString(),inLanguage:locale,dateModified:e.updatedAt,
 ...(e.image?{image:new URL(e.image,siteUrl()).toString()}:{}),publisher:{'@type':'Organization',name:'VISUAA'}};
}
export function safeJsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}
export { publicPaths };
