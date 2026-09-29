import {database} from '@/db/client';
import {getUser} from '@/lib/auth';
import {can} from '@/lib/permissions';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const identifier=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type AssetRow={name:string;mime_type:string;byte_size:number;chunk_size:number;chunk_count:number;is_public:boolean};

function responseHeaders(row:AssetRow,length:number){
 const fallback=row.name.replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,120)||'media';
 return {'Content-Type':row.mime_type,'Content-Length':String(length),'Content-Disposition':`inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(row.name)}`,'Accept-Ranges':'bytes','Cache-Control':row.is_public?'public, max-age=300, must-revalidate':'private, no-store','X-Content-Type-Options':'nosniff'};
}
async function visibleAsset(id:string,request:Request){
 const url='/media-files/'+id,attachment=JSON.stringify({attachments:[{assetId:id}]});
 const row=(await (await database()).query<AssetRow>(`SELECT a.name,a.mime_type,a.byte_size,a.chunk_size,a.chunk_count,
  (EXISTS(SELECT 1 FROM media m JOIN fiches f ON f.id=m.fiche_id WHERE m.url=$2 AND f.status='published')
   OR EXISTS(SELECT 1 FROM fiches f WHERE f.status='published' AND f.metadata @> $3::jsonb)) AS is_public
  FROM media_assets a WHERE a.id=$1 AND a.status='ready'`,[id,url,attachment])).rows[0];
 if(!row)return null;if(row.is_public)return row;
 return can(await getUser(request),'content:write')?row:null;
}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!identifier.test(id))return new Response('Fichier introuvable.',{status:404});
 try{
  const row=await visibleAsset(id,request);if(!row)return new Response('Fichier introuvable.',{status:404});
  const range=request.headers.get('range');
  if(range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(range.trim());if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${row.byte_size}`}});
   const start=match[1]?Number(match[1]):Math.max(0,row.byte_size-Number(match[2]));
   const requestedEnd=match[2]&&match[1]?Number(match[2]):row.byte_size-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(requestedEnd)||start<0||start>=row.byte_size||requestedEnd<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${row.byte_size}`}});
   const end=Math.min(requestedEnd,row.byte_size-1,start+row.chunk_size-1),first=Math.floor(start/row.chunk_size),last=Math.floor(end/row.chunk_size);
   const parts=(await (await database()).query<{position:number;data:Uint8Array}>('SELECT position,data FROM media_asset_chunks WHERE media_id=$1 AND position BETWEEN $2 AND $3 ORDER BY position',[id,first,last])).rows;
   if(parts.length!==last-first+1)return new Response('Fichier momentanément indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});
   const combined=Buffer.concat(parts.map(part=>Buffer.from(part.data))),offset=start-first*row.chunk_size,body=combined.subarray(offset,offset+(end-start+1));
   return new Response(Uint8Array.from(body).buffer,{status:206,headers:{...responseHeaders(row,body.length),'Content-Range':`bytes ${start}-${end}/${row.byte_size}`}});
  }
  let position=0;const db=await database();
  const stream=new ReadableStream<Uint8Array>({async pull(controller){
   if(position>=row.chunk_count){controller.close();return}
   try{const part=(await db.query<{data:Uint8Array}>('SELECT data FROM media_asset_chunks WHERE media_id=$1 AND position=$2',[id,position++])).rows[0];if(!part)throw new Error('Morceau manquant');controller.enqueue(Uint8Array.from(part.data))}catch(error){controller.error(error)}
  }});
  return new Response(stream,{headers:responseHeaders(row,row.byte_size)});
 }catch{return new Response('Fichier momentanément indisponible.',{status:503,headers:{'Cache-Control':'no-store'}})}
}

export async function HEAD(request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!identifier.test(id))return new Response(null,{status:404});
 try{const row=await visibleAsset(id,request);return row?new Response(null,{headers:responseHeaders(row,row.byte_size)}):new Response(null,{status:404})}catch{return new Response(null,{status:503,headers:{'Cache-Control':'no-store'}})}
}
