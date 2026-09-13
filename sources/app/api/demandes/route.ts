import { database } from '@/db/client';
import { leadInput } from '@/lib/validation';
import { jsonBody,apiError,rateLimit,networkKey,digest } from '@/lib/security';
import { getUser } from '@/lib/auth';
import { HttpError } from '@/lib/permissions';
export async function POST(request:Request){try{
 const parsed=leadInput.safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Vérifiez vos coordonnées, votre message et votre accord.');
 const d=parsed.data;if(d.website)throw new HttpError(400,'Demande non acceptée.');
 const user=await getUser(request),db=await database();
 const fingerprint=digest(JSON.stringify([d.name,d.email,d.organization,d.intent,d.message,d.ficheId||null,user?.id||null]));
 const old=(await db.query<{fingerprint:string}>('SELECT fingerprint FROM requests WHERE id=$1',[d.id])).rows[0];
 if(old){if(old.fingerprint!==fingerprint)throw new HttpError(409,'Cette référence correspond déjà à une autre demande.');return Response.json({reference:'VIS-'+d.id.slice(0,8).toUpperCase()})}
 await rateLimit('request',networkKey(request),20);await rateLimit('request-email',d.email,5);
 if(d.ficheId && !(await db.query("SELECT id FROM fiches WHERE id=$1 AND status='published'",[d.ficheId])).rowCount)throw new HttpError(400,'Fiche indisponible.');
 await db.query('INSERT INTO requests (id,fiche_id,user_id,name,email,organization,intent,message,fingerprint) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING',[d.id,d.ficheId||null,user?.id||null,d.name,d.email,d.organization,d.intent,d.message,fingerprint]);
 const saved=(await db.query<{fingerprint:string}>('SELECT fingerprint FROM requests WHERE id=$1',[d.id])).rows[0];
 if(saved.fingerprint!==fingerprint)throw new HttpError(409,'Référence déjà utilisée.');
 return Response.json({reference:'VIS-'+d.id.slice(0,8).toUpperCase()},{status:201});
 }catch(error){return apiError(error)}}
