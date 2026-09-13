import { registration } from '@/lib/validation';
import { jsonBody,apiError,rateLimit,networkKey } from '@/lib/security';
import { provisionUser,createSession,cookieHeader } from '@/lib/auth';
import { HttpError } from '@/lib/permissions';
export async function POST(request: Request) {
 try {
  const parsed=registration.safeParse(await jsonBody(request));if(!parsed.success)throw new HttpError(400,'Nom, e-mail et mot de passe de 12 à 128 caractères requis.');
  await rateLimit('register',networkKey(request),10);
  const reserved=[process.env.ADMIN_EMAILS,process.env.EDITOR_EMAILS].join(',').split(',').map(v=>v.trim().toLowerCase());
  if(reserved.includes(parsed.data.email))throw new HttpError(409,'Cette adresse doit être provisionnée par un administrateur.');
  const id=await provisionUser(parsed.data.email,parsed.data.name,'viewer',parsed.data.password);
  const token=await createSession(id);
  return Response.json({ok:true},{status:201,headers:{'Set-Cookie':cookieHeader(token),'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}
}
