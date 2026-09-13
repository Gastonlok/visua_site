import { cache } from 'react';
import { listContent, contentBySlug } from '../db/repository';
export async function listExperiences(all = false) {
 try { return { items: await listContent(all), unavailable: false }; }
 catch (error) { console.error('[catalogue]', error instanceof Error ? error.message : 'Erreur'); return { items: [], unavailable: true }; }
}
export const getExperience = cache(contentBySlug);
