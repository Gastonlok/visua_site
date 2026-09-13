import { database } from '@/db/client';
import { getUser } from '@/lib/auth';
import { demand } from '@/lib/permissions';
import { apiError,pageNumber } from '@/lib/security';
export async function GET(request:Request){try{
 const user=await getUser(request);demand(user,'audit:read');const page=pageNumber(request),db=await database();
 const items=(await db.query('SELECT id,user_id,action,target,created_at FROM audit_log ORDER BY created_at DESC,id LIMIT 30 OFFSET $1',[(page-1)*30])).rows;
 const total=Number((await db.query<{n:string}>('SELECT count(*) AS n FROM audit_log')).rows[0].n);
 return Response.json({items,total,page,pageSize:30},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error)}}
