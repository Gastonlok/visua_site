import { z } from 'zod';
import { getUser,verifyPassword,hashPassword,cookieHeader } from '@/lib/auth';
import { demand,HttpError } from '@/lib/permissions';
import { jsonBody,apiError,rateLimit } from '@/lib/security';
import { database } from '@/db/client';
import { audit } from '@/db/repository';
export async function POST(request:Request) {try {
 const user=await getUser(request); demand(user);
 const parsed=z.object({current:z.string().max(128),password:z.string().min(12).max(128)}).safeParse(await jsonBody(request));
 if(!parsed.success)throw new HttpError(400,'Mot de passe de 12 à 128 caractères requis.');
 await rateLimit('password',user.id,10,900);
 const db=await database(), row=(await db.query<{password_hash:string}>('SELECT password_hash FROM users WHERE id=$1',[user.id])).rows[0];
 if(!await verifyPassword(parsed.data.current,row.password_hash))throw new HttpError(400,'Mot de passe actuel incorrect.');
 const hash=await hashPassword(parsed.data.password);
 await db.transaction(async tx=>{await tx.query('UPDATE users SET password_hash=$1,updated_at=now() WHERE id=$2',[hash,user.id]);await tx.query('DELETE FROM sessions WHERE user_id=$1',[user.id]);await audit(tx,user.id,'password:change',user.id)});
 return Response.json({ok:true},{headers:{'Set-Cookie':cookieHeader('',0)}});
 }catch(error){return apiError(error)}}
