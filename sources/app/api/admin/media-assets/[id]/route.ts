import {database} from '@/db/client';
import {audit} from '@/db/repository';
import {getUser} from '@/lib/auth';
import {siteUrl} from '@/lib/config';
import {demand,HttpError,type User} from '@/lib/permissions';
import {apiError,jsonBody} from '@/lib/security';

export const runtime='nodejs';
const identifier=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type UploadRow={id:string;mime_type:string;byte_size:number;chunk_size:number;chunk_count:number;status:string;created_by:string|null};

function owned(row:UploadRow,user:User){if(user.role!=='admin'&&row.created_by!==user.id)throw new HttpError(403,'Vous ne pouvez gérer que vos propres fichiers.');}
async function exactBody(request:Request,expected:number){
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Morceau manquant.');const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>expected){await reader.cancel();throw new HttpError(413,'Morceau trop volumineux.')}chunks.push(value)}}finally{reader.releaseLock()}
 if(size!==expected)throw new HttpError(400,'Taille du morceau incorrecte.');return Buffer.concat(chunks.map(chunk=>Buffer.from(chunk)));
}
function validSignature(type:string,data:Buffer){
 if(type==='application/pdf')return data.subarray(0,5).toString()==='%PDF-';
 if(type==='video/mp4')return data.length>=12&&data.subarray(4,8).toString()==='ftyp';
 if(type==='video/webm')return data.length>=4&&data[0]===0x1a&&data[1]===0x45&&data[2]===0xdf&&data[3]===0xa3;
 return false;
}

export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await getUser(request);demand(user,'content:write');
 if(request.headers.get('origin')!==siteUrl())throw new HttpError(403,'Origine de la requête non autorisée.');
 const {id}=await params;if(!identifier.test(id))throw new HttpError(404,'Import introuvable.');
 const db=await database(),row=(await db.query<UploadRow>('SELECT id,mime_type,byte_size,chunk_size,chunk_count,status,created_by FROM media_assets WHERE id=$1',[id])).rows[0];
 if(!row)throw new HttpError(404,'Import introuvable.');owned(row,user);
 if(row.status!=='uploading')throw new HttpError(409,'Ce fichier est déjà finalisé.');
 const position=Number(request.headers.get('x-chunk-index'));
 if(!Number.isSafeInteger(position)||position<0||position>=row.chunk_count)throw new HttpError(400,'Numéro de morceau invalide.');
 const expected=position===row.chunk_count-1?row.byte_size-position*row.chunk_size:row.chunk_size;
 const announced=Number(request.headers.get('content-length')||0);if(announced&&announced!==expected)throw new HttpError(400,'Taille du morceau incorrecte.');
 const data=await exactBody(request,expected);
 if(position===0&&!validSignature(row.mime_type,data))throw new HttpError(400,'Le contenu du fichier ne correspond pas au format annoncé.');
 await db.query('INSERT INTO media_asset_chunks (media_id,position,data,byte_size) VALUES ($1,$2,$3,$4) ON CONFLICT (media_id,position) DO UPDATE SET data=EXCLUDED.data,byte_size=EXCLUDED.byte_size',[id,position,data,data.length]);
 return Response.json({ok:true,position},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await getUser(request);demand(user,'content:write');await jsonBody(request);
 const {id}=await params;if(!identifier.test(id))throw new HttpError(404,'Import introuvable.');
 const db=await database();await db.transaction(async tx=>{
  const row=(await tx.query<UploadRow>('SELECT id,mime_type,byte_size,chunk_size,chunk_count,status,created_by FROM media_assets WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!row)throw new HttpError(404,'Import introuvable.');owned(row,user);
  if(row.status==='ready')return;
  const complete=(await tx.query<{parts:number;total:number}>('SELECT count(*)::int AS parts,coalesce(sum(byte_size),0)::int AS total FROM media_asset_chunks WHERE media_id=$1',[id])).rows[0];
  if(Number(complete.parts)!==row.chunk_count||Number(complete.total)!==row.byte_size)throw new HttpError(409,'Tous les morceaux du fichier ne sont pas encore reçus.');
  await tx.query("UPDATE media_assets SET status='ready' WHERE id=$1",[id]);await audit(tx,user.id,'media:upload',id);
 });
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}

export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await getUser(request);demand(user,'content:write');await jsonBody(request);
 const {id}=await params;if(!identifier.test(id))throw new HttpError(404,'Fichier introuvable.');
 const db=await database();await db.transaction(async tx=>{
  const row=(await tx.query<UploadRow>('SELECT id,mime_type,byte_size,chunk_size,chunk_count,status,created_by FROM media_assets WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!row)throw new HttpError(404,'Fichier introuvable.');owned(row,user);
  const url='/media-files/'+id,attachment=JSON.stringify({attachments:[{assetId:id}]});
  const used=await tx.query('SELECT fiche_id AS id FROM media WHERE url=$1 UNION ALL SELECT id FROM fiches WHERE metadata @> $2::jsonb LIMIT 1',[url,attachment]);
  if(used.rowCount)throw new HttpError(409,'Retirez d’abord ce fichier des fiches qui l’utilisent.');
  await tx.query('DELETE FROM media_assets WHERE id=$1',[id]);await audit(tx,user.id,'media:delete',id);
 });
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
