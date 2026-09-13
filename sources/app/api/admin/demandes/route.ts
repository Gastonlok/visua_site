import { database } from '@/db/client';
import { audit } from '@/db/repository';
import { getUser } from '@/lib/auth';
import { demand,HttpError } from '@/lib/permissions';
import { jsonBody,apiError,pageNumber } from '@/lib/security';
import { z } from 'zod';
export async function GET(request:Request){try{
 const user=await getUser(request);demand(user);const page=pageNumber(request);
 let condition=user.role==='admin'?'TRUE':user.role==='editor'?'r.fiche_id IN (SELECT id FROM fiches WHERE author_id=$1)':'r.user_id=$1';
 const values:unknown[]=user.role==='admin'?[]:[user.id],db=await database();
 const status=new URL(request.url).searchParams.get('status');
 if(status){if(!['new','contacted','quoted','closed'].includes(status))throw new HttpError(400,'Statut invalide.');values.push(status);condition+=' AND r.status=$'+values.length;}
 const total=Number((await db.query<{n:string}>('SELECT count(*) AS n FROM requests r WHERE '+condition,values)).rows[0].n);
 const rows=(await db.query('SELECT r.id,r.fiche_id,r.name,r.email,r.organization,r.intent,r.message,r.status,r.created_at FROM requests r WHERE '+condition+' ORDER BY r.created_at DESC,r.id LIMIT 20 OFFSET $'+(values.length+1),[...values,(page-1)*20])).rows;
 return Response.json({items:rows,total,page,pageSize:20},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
export async function PATCH(request:Request){try{
 const user=await getUser(request);demand(user,'requests:manage');
 const parsed=z.object({id:z.string().uuid(),status:z.enum(['new','contacted','quoted','closed','deleted'])}).safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Statut invalide.');
 await (await database()).transaction(async tx=>{
  const {id,status}=parsed.data;const r=status==='deleted'?await tx.query('DELETE FROM requests WHERE id=$1',[id]):await tx.query('UPDATE requests SET status=$1,updated_at=now() WHERE id=$2',[status,id]);
  if(!r.rowCount)throw new HttpError(404,'Demande introuvable.');await audit(tx,user.id,'request:'+status,id);
 });return Response.json({ok:true});
 }catch(error){return apiError(error)}}
