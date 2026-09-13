import type { Experience } from './models';
import { domainOf,provinceMatches,searchText } from './catalogue-metadata';
import { categoryOf } from './catalogue-groups';
export type SearchParams=Record<string,string|string[]|undefined>;
export function queryValue(params:SearchParams,key:string){const v=params[key];return typeof v==='string'?v:''}
export function filterCatalogue(items:Experience[],params:SearchParams,kind='all'){
 const query=queryValue(params,'q').slice(0,200).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const type=queryValue(params,'type')||kind,province=queryValue(params,'province'),domain=queryValue(params,'domaine'),family=queryValue(params,'famille'),format=queryValue(params,'format');
 const filtered=items.filter(e=>(type==='all'||e.kind===type)&&(!query||searchText(e).includes(query))&&(!province||province==='all'||provinceMatches(e,province))&&(!domain||domain==='all'||domainOf(e)===domain)&&(!family||family==='all'||categoryOf(e)===family)&&(!format||format==='all'||e.format===format));
 const pageSize=12,total=filtered.length,pages=Math.max(1,Math.ceil(total/pageSize)),requested=Number(queryValue(params,'page')||1),page=Number.isSafeInteger(requested)&&requested>0?Math.min(requested,pages):1;
 return {items:filtered.slice((page-1)*pageSize,page*pageSize),total,page,pages,pageSize};
}
