export type Locale='fr'|'en';
export const localeCookie='visua_locale';
export function isLocale(value:unknown):value is Locale{return value==='fr'||value==='en'}
export function resolveLocale(query:unknown,cookie:unknown):Locale{return isLocale(query)?query:isLocale(cookie)?cookie:'fr'}
/** Preserve filters, anchors and stable public routes. Never rewrite external or asset URLs. */
export function languageHref(href:string,locale:Locale):string{
if(!href.startsWith('/')||href.startsWith('//')||/^\/(?:api|documents|images|signin-with-chatgpt|signout-with-chatgpt|callback)(?:\/|\?|$)/.test(href)||/\.[a-z0-9]{2,5}(?:\?|#|$)/i.test(href))return href;
const u=new URL(href,'https://visua.invalid');u.searchParams.set('lang',locale);return u.pathname+u.search+u.hash;
}
