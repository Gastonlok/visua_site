import { database } from '@/db/client';
import { audit } from '@/db/repository';
import { getUser } from '@/lib/auth';
import { demand,HttpError } from '@/lib/permissions';
import { jsonBody,apiError } from '@/lib/security';
import { getSettings,settingsInput,publicPaths } from '@/lib/settings';
export async function GET(request:Request){try{const user=await getUser(request);demand(user,'settings:manage');return Response.json(await getSettings(),{headers:{'Cache-Control':'no-store'}})}catch(error){return apiError(error)}}
export async function PUT(request:Request){try{
 const user=await getUser(request);demand(user,'settings:manage');
 const parsed=settingsInput.safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Vérifiez les paramètres et les chemins de redirection.');
 const value=parsed.data,sources=new Set<string>(),db=await database();
 for(const r of value.redirects){
  r.source=r.source.replace(/\/$/,'');r.destination=r.destination.replace(/\/$/,'')||'/';
  if(sources.has(r.source)||publicPaths.includes(r.source)||/^\/(api|dashboard|admin|connexion|inscription|_next|experiences|a-propos|services)(\/|$)/.test(r.source))throw new HttpError(400,'Une redirection ne peut pas remplacer une route existante ni être dupliquée.');
  sources.add(r.source);
  if(!publicPaths.includes(r.destination) && !(r.destination.startsWith('/experiences/')&&(await db.query("SELECT id FROM fiches WHERE slug=$1 AND status='published'",[r.destination.slice('/experiences/'.length)])).rowCount))throw new HttpError(400,'La destination doit être une page publique ou une fiche publiée.');
 }
 await db.transaction(async tx=>{await tx.query("INSERT INTO settings (key,value) VALUES ('site',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()",[JSON.stringify(value)]);await audit(tx,user.id,'settings:update','site')});
 return Response.json({ok:true});
 }catch(error){return apiError(error)}}
