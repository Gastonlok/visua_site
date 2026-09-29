import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {database} from '@/db/client';
import {audit} from '@/db/repository';
import {getUser} from '@/lib/auth';
import {contentCategories} from '@/lib/content-categories';
import {MEDIA_CHUNK_BYTES,mediaAssetUrl,mediaType} from '@/lib/media-assets';
import {demand,HttpError} from '@/lib/permissions';
import {apiError,jsonBody} from '@/lib/security';

export const runtime='nodejs';
export const dynamic='force-dynamic';

type AssetRow={id:string;name:string;kind:'video'|'document';mime_type:string;byte_size:number;category:string;created_at:string|Date;created_by:string|null};
const categories=new Set(contentCategories.map(category=>category.id));
const input=z.object({name:z.string().trim().min(1).max(180),mimeType:z.string().max(100),size:z.number().int().positive(),category:z.string().max(80).refine(value=>categories.has(value),'Catégorie inconnue.')});

export async function GET(request:Request){try{
 const user=await getUser(request);demand(user,'content:write');
 const rows=(await (await database()).query<AssetRow>("SELECT id,name,kind,mime_type,byte_size,category,created_at,created_by FROM media_assets WHERE status='ready' ORDER BY created_at DESC,id")).rows;
 return Response.json({items:rows.map(row=>({id:row.id,name:row.name,kind:row.kind,mimeType:row.mime_type,byteSize:row.byte_size,category:row.category,url:mediaAssetUrl(row.id),previewUrl:'/api/admin/media-assets/'+row.id+'/content',createdAt:new Date(row.created_at).toISOString(),createdBy:row.created_by}))},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}

export async function POST(request:Request){try{
 const user=await getUser(request);demand(user,'content:write');
 const parsed=input.safeParse(await jsonBody(request));
 if(!parsed.success)throw new HttpError(400,parsed.error.issues[0]?.message||'Fichier et catégorie requis.');
 const accepted=mediaType(parsed.data.mimeType);
 if(!accepted)throw new HttpError(415,'Choisissez une vidéo MP4 ou WebM, ou un document PDF.');
 if(parsed.data.size>accepted.maximum)throw new HttpError(413,accepted.kind==='video'?'La vidéo dépasse la limite de 100 Mo.':'Le document dépasse la limite de 15 Mo.');
 const id=randomUUID(),chunkCount=Math.ceil(parsed.data.size/MEDIA_CHUNK_BYTES),db=await database();
 await db.transaction(async tx=>{
  await tx.query("DELETE FROM media_assets WHERE status='uploading' AND created_at < now() - interval '24 hours'");
  await tx.query('INSERT INTO media_assets (id,name,kind,mime_type,byte_size,category,chunk_size,chunk_count,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,parsed.data.name,accepted.kind,parsed.data.mimeType,parsed.data.size,parsed.data.category,MEDIA_CHUNK_BYTES,chunkCount,user.id]);
  await audit(tx,user.id,'media:upload-start',id);
 });
 return Response.json({id,chunkSize:MEDIA_CHUNK_BYTES,chunkCount},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
