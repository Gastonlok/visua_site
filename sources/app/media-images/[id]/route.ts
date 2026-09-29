import { database } from '@/db/client';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const identifier=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!identifier.test(id))return new Response('Image introuvable.',{status:404});
 try{
  const row=(await (await database()).query<{mime_type:string;data:Uint8Array}>('SELECT mime_type,data FROM uploaded_images WHERE id=$1',[id])).rows[0];
  if(!row)return new Response('Image introuvable.',{status:404});
  const body=Uint8Array.from(row.data).buffer;
  return new Response(body,{headers:{'Content-Type':row.mime_type,'Content-Length':String(row.data.length),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 }catch{
  return new Response('Image momentanément indisponible.',{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
