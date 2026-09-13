import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';

import { database } from '../db/client';
import { digest } from './security';
import type { User } from './permissions';
import { siteUrl } from './config';
export const sessionCookie='visuaa_session';
const lifetime=7*24*60*60;
function derive(password: string,salt: string) {
 return new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
}
export async function hashPassword(password: string) {
 const salt=randomBytes(16).toString('hex'); return 'scrypt$'+salt+'$'+(await derive(password,salt)).toString('hex');
}
export async function verifyPassword(password: string, stored: string) {
 const [algorithm,salt,hash]=stored.split('$');
 if(algorithm!=='scrypt'||!salt||!hash||hash.length!==128) return false;
 const actual=await derive(password,salt); return timingSafeEqual(actual,Buffer.from(hash,'hex'));
}
export async function createSession(userId: string) {
 const token=randomBytes(32).toString('hex'); const db=await database();
 await db.query('DELETE FROM sessions WHERE expires_at < now()');
 await db.query('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)',[digest(token),userId,new Date(Date.now()+lifetime*1000).toISOString()]);
 return token;
}
export function cookieHeader(token: string,maxAge=lifetime) {
 return sessionCookie+'='+token+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+maxAge+(siteUrl().startsWith('https:')?'; Secure':'');
}
export async function getUser(request?: Request): Promise<User|null> {
 const token=request ? request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1) : (await (await import('next/headers')).cookies()).get(sessionCookie)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token)) return null;
 const result=await (await database()).query<User>("SELECT u.id,u.email,u.name,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.status='active'",[digest(token)]);
 return result.rows[0]||null;
}
export async function revokeSession(request: Request) {
 const token=request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(sessionCookie+'='))?.slice(sessionCookie.length+1);
 if(token) await (await database()).query('DELETE FROM sessions WHERE token_hash=$1',[digest(token)]);
}
export async function provisionUser(email: string, name: string, role: User['role'], password: string) {
 const id=randomUUID(), passwordHash=await hashPassword(password);
 await (await database()).query('INSERT INTO users (id,email,name,role,password_hash) VALUES ($1,$2,$3,$4,$5)',[id,email.trim().toLowerCase(),name,role,passwordHash]);
 return id;
}
