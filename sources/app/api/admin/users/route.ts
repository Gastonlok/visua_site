import { z } from 'zod';
import { database } from '@/db/client';
import { audit } from '@/db/repository';
import { getUser,hashPassword } from '@/lib/auth';
import { registration } from '@/lib/validation';
import { demand,HttpError } from '@/lib/permissions';
import { jsonBody,apiError,pageNumber } from '@/lib/security';
import { randomUUID } from 'node:crypto';
export async function GET(request:Request){try{
 const actor=await getUser(request);demand(actor,'users:manage');const page=pageNumber(request),db=await database();
 const items=(await db.query('SELECT id,email,name,role,status,created_at FROM users ORDER BY created_at DESC,id LIMIT 20 OFFSET $1',[(page-1)*20])).rows;
 const total=Number((await db.query<{n:string}>('SELECT count(*) AS n FROM users')).rows[0].n);
 return Response.json({items,total,page,pageSize:20},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
export async function POST(request:Request){try{
 const actor=await getUser(request);demand(actor,'users:manage');
 const parsed=registration.extend({role:z.enum(['admin','editor','viewer'])}).safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Vérifiez le nom, le rôle, l’adresse et le mot de passe (12 caractères minimum).');
 const d=parsed.data,id=randomUUID(),hash=await hashPassword(d.password);
 await (await database()).transaction(async tx=>{await tx.query('INSERT INTO users (id,email,name,role,password_hash) VALUES ($1,$2,$3,$4,$5)',[id,d.email,d.name,d.role,hash]);await audit(tx,actor.id,'user:create',id)});
 return Response.json({id},{status:201});
 }catch(error){return apiError(error)}}
export async function PATCH(request:Request){try{
 const actor=await getUser(request);demand(actor,'users:manage');
 const parsed=z.object({id:z.string().uuid(),role:z.enum(['admin','editor','viewer']),status:z.enum(['active','disabled']),password:z.string().min(12).max(128).optional()}).safeParse(await jsonBody(request));
 if(!parsed.success)throw new HttpError(400,'Vérifiez le rôle, le statut et le mot de passe.');
 const d=parsed.data,hash=d.password?await hashPassword(d.password):null;
 await (await database()).transaction(async tx=>{
  // Serialize changes to the active administrator set, preserving the last administrator.
  const admins=(await tx.query<{id:string}>("SELECT id FROM users WHERE role='admin' AND status='active' ORDER BY id FOR UPDATE")).rows;
  const user=(await tx.query<{id:string;role:string;status:string}>('SELECT id,role,status FROM users WHERE id=$1 FOR UPDATE',[d.id])).rows[0];
  if(!user)throw new HttpError(404,'Utilisateur introuvable.');
  if(admins.length===1 && admins[0].id===d.id && (d.role!=='admin'||d.status!=='active'))throw new HttpError(409,'Conservez au moins un administrateur actif.');
  await tx.query('UPDATE users SET role=$1,status=$2,password_hash=COALESCE($3,password_hash),updated_at=now() WHERE id=$4',[d.role,d.status,hash,d.id]);
  await tx.query('DELETE FROM sessions WHERE user_id=$1',[d.id]);await audit(tx,actor.id,'user:update',d.id);
 });return Response.json({ok:true});
 }catch(error){return apiError(error)}}
export async function DELETE(request:Request){try{
 const actor=await getUser(request);demand(actor,'users:manage');
 const parsed=z.object({id:z.string().uuid()}).safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Identifiant invalide.');
 const id=parsed.data.id;
 if(id===actor.id)throw new HttpError(409,'Utilisez un autre administrateur pour supprimer votre compte.');
 await (await database()).transaction(async tx=>{
  await tx.query("SELECT id FROM users WHERE role='admin' AND status='active' ORDER BY id FOR UPDATE");
  await tx.query('DELETE FROM requests WHERE user_id=$1',[id]);
  if(!(await tx.query('DELETE FROM users WHERE id=$1',[id])).rowCount)throw new HttpError(404,'Utilisateur introuvable.');
  await audit(tx,actor.id,'user:delete',id);
 });return Response.json({ok:true});
 }catch(error){return apiError(error)}}
