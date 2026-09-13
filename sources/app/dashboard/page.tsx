import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { database } from '@/db/client';
import Dashboard from './workspace';
import type {AdminSummary} from './admin-overview';
export const metadata={title:'Mon espace',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{tab?:string;status?:string;action?:string;fiche?:string}>}){
 const user=await getUser();if(!user)redirect('/connexion');
 const db=await database();
 const content=Number((await db.query<{n:string}>(user.role==='viewer'?"SELECT count(*) AS n FROM fiches WHERE status='published'":'SELECT count(*) AS n FROM fiches')).rows[0].n);
 const condition=user.role==='admin'?'TRUE':user.role==='editor'?'fiche_id IN (SELECT id FROM fiches WHERE author_id=$1)':'user_id=$1';
 const requests=Number((await db.query<{n:string}>('SELECT count(*) AS n FROM requests WHERE '+condition,user.role==='admin'?[]:[user.id])).rows[0].n);
 const users=user.role==='admin'?Number((await db.query<{n:string}>('SELECT count(*) AS n FROM users')).rows[0].n):null;
 let summary:AdminSummary|undefined;
 if(user.role==='admin'){
  const [states,metrics,recent]=await Promise.all([
   db.query<{status:string;n:string}>('SELECT status,count(*) AS n FROM fiches GROUP BY status'),
   db.query<{new_requests:string;active_users:string;media:string}>("SELECT (SELECT count(*) FROM requests WHERE status='new') AS new_requests,(SELECT count(*) FROM users WHERE status='active') AS active_users,(SELECT count(*) FROM media) AS media"),
   db.query<{id:string;title:string;status:string;updated_at:string}>('SELECT id,title,status,updated_at FROM fiches ORDER BY updated_at DESC,id LIMIT 6')
  ]);
  summary={states:Object.fromEntries(states.rows.map(s=>[s.status,Number(s.n)])),newRequests:Number(metrics.rows[0].new_requests),activeUsers:Number(metrics.rows[0].active_users),media:Number(metrics.rows[0].media),recent:recent.rows.map(r=>({...r,updated_at:new Date(r.updated_at).toISOString()}))};
 }
 const params=await searchParams;
 return <Dashboard user={user} tab={params.tab||'overview'} filters={params} stats={{content,requests,users}} summary={summary}/>;
}
