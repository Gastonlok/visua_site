import { listContent,saveContent,deleteContent } from '@/db/repository';
import { getUser } from '@/lib/auth';
import { demand,HttpError } from '@/lib/permissions';
import { jsonBody,apiError } from '@/lib/security';
import { experienceInput,publicationIssue } from '@/lib/validation';
import { z } from 'zod';
export async function GET(request:Request){try{const user=await getUser(request);demand(user,'content:write');return Response.json({items:await listContent(true)},{headers:{'Cache-Control':'no-store'}})}catch(error){return apiError(error)}}
export async function POST(request:Request){try{
 const user=await getUser(request);demand(user,'content:write');const parsed=experienceInput.safeParse(await jsonBody(request));
 if(!parsed.success)throw new HttpError(400,'Vérifiez les champs, les médias et les limites de longueur.');
 const issue=publicationIssue(parsed.data);if(issue)throw new HttpError(400,issue);
 return Response.json({item:await saveContent(parsed.data,user)});
 }catch(error){return apiError(error)}}
export async function DELETE(request:Request){try{
 const user=await getUser(request);demand(user,'content:delete');
 const parsed=z.object({id:z.string(),version:z.number().int()}).safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Identifiant et version requis.');
 await deleteContent(parsed.data.id,parsed.data.version,user);return Response.json({ok:true});
 }catch(error){return apiError(error)}}
