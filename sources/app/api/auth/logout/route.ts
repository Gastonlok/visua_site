import { jsonBody,apiError } from '@/lib/security';
import { revokeSession,cookieHeader } from '@/lib/auth';
export async function POST(request:Request){try{await jsonBody(request);await revokeSession(request);return Response.json({ok:true},{headers:{'Set-Cookie':cookieHeader('',0),'Cache-Control':'no-store'}})}catch(error){return apiError(error)}}
