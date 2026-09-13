import { context } from './headers.mjs';
export function usePathname(){return context.path.split('?')[0]}
export function notFound(){throw Object.assign(new Error('NEXT_NOT_FOUND'),{status:404})}
export function redirect(url){throw Object.assign(new Error('NEXT_REDIRECT'),{status:307,url})}
export function permanentRedirect(url){throw Object.assign(new Error('NEXT_REDIRECT'),{status:308,url})}
