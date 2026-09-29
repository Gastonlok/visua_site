import { randomUUID } from 'node:crypto';
import { database } from '@/db/client';
import { audit } from '@/db/repository';
import { getUser } from '@/lib/auth';
import { siteUrl } from '@/lib/config';
import { demand,HttpError } from '@/lib/permissions';
import { apiError } from '@/lib/security';

export const runtime='nodejs';
const maxBytes=4_000_000;
const acceptedTypes=new Set(['image/jpeg','image/png','image/webp','image/avif']);
const acceptedFormats=new Set(['jpeg','png','webp','avif']);

export async function POST(request:Request){try{
 const user=await getUser(request);demand(user,'content:write');
 if(request.headers.get('origin')!==siteUrl())throw new HttpError(403,'Origine de la requête non autorisée.');
 const type=request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()||'';
 if(!acceptedTypes.has(type))throw new HttpError(415,'Choisissez une image JPEG, PNG, WebP ou AVIF.');
 const announced=Number(request.headers.get('content-length')||0);
 if(announced>maxBytes)throw new HttpError(413,'L’image dépasse la limite de 4 Mo.');
 const input=Buffer.from(await request.arrayBuffer());
 if(!input.length)throw new HttpError(400,'Le fichier image est vide.');
 if(input.length>maxBytes)throw new HttpError(413,'L’image dépasse la limite de 4 Mo.');
 let data:Buffer;
 try{
  const {default:sharp}=await import('sharp');
  const metadata=await sharp(input,{limitInputPixels:25_000_000}).metadata();
  if(!metadata.format||!acceptedFormats.has(metadata.format))throw new Error('Format non pris en charge');
  data=await sharp(input,{limitInputPixels:25_000_000}).rotate().resize({width:2400,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toBuffer();
 }catch{throw new HttpError(400,'Le fichier ne contient pas une image valide.');}
 const id=randomUUID(),db=await database();
 await db.transaction(async tx=>{
  await tx.query("DELETE FROM uploaded_images WHERE fiche_id IS NULL AND created_at < now() - interval '24 hours'");
  await tx.query('INSERT INTO uploaded_images (id,mime_type,data,byte_size,created_by) VALUES ($1,$2,$3,$4,$5)',[id,'image/webp',data,data.length,user.id]);
  await audit(tx,user.id,'image:upload',id);
 });
 return Response.json({url:'/media-images/'+id,mimeType:'image/webp',size:data.length},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
