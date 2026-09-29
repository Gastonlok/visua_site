import { z } from 'zod';
import { database } from '../db/client';
export const publicPaths=['/','/catalogue','/metiers','/metiers/enfants','/destinations','/destinations/enfants','/actualite','/experiences','/organisations','/qui-sommes-nous','/offres','/contact','/ressources','/mentions-legales','/confidentialite','/cookies','/accessibilite','/credits'];
export const settingsInput=z.object({
 brand:z.string().trim().min(2).max(40), seoTitle:z.string().trim().min(5).max(120), seoDescription:z.string().trim().min(20).max(300),
 redirects:z.array(z.object({source:z.string().regex(/^\/[a-zA-Z0-9/_-]+$/).max(300),destination:z.string().regex(/^\/[a-zA-Z0-9/_-]*$/).max(300)})).max(200),
});
export type SiteSettings=z.infer<typeof settingsInput>;
export const defaultSettings: SiteSettings={brand:'VISUAA',seoTitle:'VISUAA — Métiers & territoires de la RDC',seoDescription:'Découvrez les métiers et les territoires de la RDC. Explorez des fiches documentées, essayez le panorama 360° et préparez une démonstration.',redirects:[]};
export async function getSettings():Promise<SiteSettings> {
 try {const row=(await (await database()).query<{value:unknown}>("SELECT value FROM settings WHERE key='site'")).rows[0];return row?settingsInput.parse(row.value):defaultSettings;}
 catch {return defaultSettings;}
}
export function redirectDestination(path:string,settings:SiteSettings) { return settings.redirects.find(r=>r.source.replace(/\/$/,'')===path.replace(/\/$/,''))?.destination || null; }
