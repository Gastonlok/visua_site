import { createHmac } from 'node:crypto';
import { database } from '../db/client';
import { authSecret, siteUrl } from './config';
import { HttpError } from './permissions';
export function digest(value: string) { return createHmac('sha256',authSecret()).update(value).digest('hex'); }
export async function jsonBody(request: Request): Promise<unknown> {
 if (request.headers.get('origin') !== siteUrl()) throw new HttpError(403,'Origine de la requête non autorisée.');
 if (!request.headers.get('content-type')?.startsWith('application/json')) throw new HttpError(415,'Format JSON requis.');
 const reader=request.body?.getReader(); if (!reader) throw new HttpError(400,'Corps manquant.');
 const chunks: Uint8Array[]=[]; let size=0;
 try { while (true) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>60000) {await reader.cancel(); throw new HttpError(413,'Requête trop volumineuse.');} chunks.push(value); } }
 finally { reader.releaseLock(); }
 try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400,'JSON invalide.'); }
}
export function apiError(error: unknown) {
 if (error instanceof HttpError) return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});
 if (error && typeof error==='object' && 'code' in error && error.code==='23505') return Response.json({error:'Cette donnée existe déjà. Rechargez puis réessayez.'},{status:409});
 console.error('[api]',error instanceof Error ? error.message : 'Erreur');
 return Response.json({error:'Service momentanément indisponible. Réessayez.'},{status:503,headers:{'Cache-Control':'no-store'}});
}
export function pageNumber(request: Request) { const value=Number(new URL(request.url).searchParams.get('page') || 1); return Number.isSafeInteger(value)&&value>0?Math.min(value,100000):1; }
export function networkKey(request: Request) {
 // Vercel replaces this header. Other hosts must implement a trusted network adapter.
 return process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'shared' : 'shared';
}
export async function rateLimit(scope: string, subject: string, maximum: number, seconds=3600) {
 const db=await database(); const now=Date.now(); const bucket=Math.floor(now/(seconds*1000));
 const key=digest(scope+'|'+subject+'|'+bucket);
 await db.query('DELETE FROM rate_limits WHERE expires_at < now()');
 const r=await db.query<{count:number}>('INSERT INTO rate_limits (key,count,expires_at) VALUES ($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count',[key,new Date((bucket+1)*seconds*1000).toISOString()]);
 if(r.rows[0].count>maximum) throw new HttpError(429,'Trop de tentatives. Réessayez plus tard.');
}
