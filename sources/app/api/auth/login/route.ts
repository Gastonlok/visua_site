import { credentials } from '@/lib/validation';
import { jsonBody,apiError,rateLimit,networkKey } from '@/lib/security';
import { database } from '@/db/client';
import { verifyPassword,hashPassword,createSession,cookieHeader } from '@/lib/auth';
import { HttpError } from '@/lib/permissions';
export async function POST(request: Request) {
 try {
  const parsed=credentials.safeParse(await jsonBody(request)); if(!parsed.success)throw new HttpError(400,'Adresse ou mot de passe invalide.');
  const {email,password}=parsed.data;
  await rateLimit('login-network',networkKey(request),40,900); await rateLimit('login-account',email,10,900);
  const user=(await (await database()).query<{id:string;password_hash:string;status:string}>('SELECT id,password_hash,status FROM users WHERE email=$1',[email])).rows[0];
  // Perform a password derivation even for an unknown account.
  const hash=user?.password_hash||await hashPassword('unknown-account-password');
  if(!await verifyPassword(password,hash)||!user||user.status!=='active')throw new HttpError(401,'Adresse ou mot de passe incorrect.');
  const token=await createSession(user.id);
  return Response.json({ok:true},{headers:{'Set-Cookie':cookieHeader(token),'Cache-Control':'no-store'}});
 } catch(error){return apiError(error)}
}
