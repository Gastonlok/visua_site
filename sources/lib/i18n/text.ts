import english from './en.json' with {type:'json'};
import type {Locale} from './locale';
const dictionary:Record<string,string>=english;
const folded=new Map(Object.entries(dictionary).map(([fr,en])=>[fr.toLocaleLowerCase('fr'),en]));
function exact(text:string):string|undefined{if(Object.prototype.hasOwnProperty.call(dictionary,text))return dictionary[text];const value=folded.get(text.toLocaleLowerCase('fr'));if(value===undefined)return undefined;return text===text.toLocaleUpperCase('fr')?value.toLocaleUpperCase('en'):value}
/** Only authored display strings are translated; ids, input values and links stay canonical. */
export function t(text:string,locale:Locale):string{
if(locale==='fr'||!text)return text;
const leading=text.match(/^\s*/)?.[0]||'',trailing=text.match(/\s*$/)?.[0]||'',core=text.trim();
if(!core)return text;
const found=exact(core)??exact(core.replace(/\s+/g,' '));if(found!==undefined)return leading+found+trailing;
const duration=core.match(/^(\d+) min de lecture$/);if(duration)return leading+duration[1]+' min read'+trailing;
const familyLabel=core.match(/^(.*?) \((\d+)\)$/);if(familyLabel)return leading+t(familyLabel[1],locale)+' ('+familyLabel[2]+')'+trailing;
if(core.includes('\n\n'))return leading+core.split(/\n\s*\n/).map(p=>t(p,locale)).join('\n\n')+trailing;
if(core.includes(' · '))return leading+core.split(' · ').map(p=>t(p,locale)).join(' · ')+trailing;
const punctuation=core.match(/^([·:—–/.,;!?\s]*)(.*?)([.:;,!?\s]*)$/);if(punctuation&&punctuation[2]!==core){const inner=exact(punctuation[2]);if(inner!==undefined)return leading+punctuation[1]+inner+punctuation[3]+trailing}
const pages=core.match(/^Pages imprimées (.+) · PDF (.+)$/);if(pages)return leading+'Printed pages '+pages[1]+' · PDF '+pages[2]+trailing;
const dynamicPatterns:[RegExp,(m:RegExpMatchArray)=>string][]=[
[/^Statut de la demande de (.+)$/,m=>'Request status for '+m[1]],
[/^Modifier : (.+)$/,m=>'Edit: '+t(m[1],locale)],
[/^Contenu enregistré — (.+)\.$/,m=>'Content saved — '+t(m[1],locale)+'.'],
[/^Titre du point (\d+)$/,m=>'Point '+m[1]+' title'],
[/^Pages imprimées (.+)$/,m=>'Printed pages '+m[1]],
[/^Page (\d+)(.*)$/,m=>'Page '+m[1]+t(m[2],locale)]
];for(const [pattern,format]of dynamicPatterns){const match=core.match(pattern);if(match)return leading+format(match)+trailing}
return text;
}
export function translatedSearchTerms(text:string):string{return t(text,'en')}
export function localizeMetadata<T>(metadata:T,locale:Locale):T{
function visit(value:unknown,key=''):unknown{if(typeof value==='string')return ['title','description','default'].includes(key)?t(value,locale):value;if(Array.isArray(value))return value.map(v=>visit(v,key));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,visit(v,k)]));return value}return visit(metadata) as T;
}
