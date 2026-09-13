import {cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';
import {t} from './text';import {languageHref,type Locale} from './locale';
const displayProps=['alt','title','placeholder','aria-label','aria-description'];
/** Translate authored React output without touching the DOM, business values, events or references. */
export function translateNode(node:ReactNode,locale:Locale):ReactNode{
if(locale==='fr')return node;
if(typeof node==='string')return t(node,locale);
if(Array.isArray(node))return node.map((child,index)=>{const translated=translateNode(child,locale);return isValidElement(translated)&&translated.key===null?cloneElement(translated,{key:'translated-'+index}):translated});
if(!isValidElement(node))return node;
const element=node as ReactElement<Record<string,unknown>>,props=element.props,changes:Record<string,unknown>={};
for(const name of displayProps)if(typeof props[name]==='string'){const value=t(props[name] as string,locale);if(value!==props[name])changes[name]=value;}
if(typeof props.href==='string'){const href=languageHref(props.href,locale);if(href!==props.href)changes.href=href;}
if(props.children!==undefined){const children=translateNode(props.children as ReactNode,locale);if(children!==props.children)changes.children=children;}
if(isValidElement(props.fallback))changes.fallback=translateNode(props.fallback,locale);
return Object.keys(changes).length?cloneElement(element,changes):node;
}
