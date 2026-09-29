import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync,readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { db,sql } from './runtime.mjs';
import { context } from './headers.mjs';
import { migrate } from '../scripts/migration-runner.ts';
import { seed } from '../lib/seed.ts';
import { seedContent,listContent,contentBySlug } from '../db/repository.ts';
import { setTestDatabase } from '../db/client.ts';
import { provisionUser,createSession,cookieHeader,getUser,verifyPassword } from '../lib/auth.ts';
import { can } from '../lib/permissions.ts';
import { experienceInput } from '../lib/validation.ts';
import { filterCatalogue } from '../lib/catalogue-query.ts';
import { pageMetadata,ficheJsonLd,safeJsonLd } from '../lib/seo.ts';
import { POST as login } from '../app/api/auth/login/route.ts';
import { POST as register } from '../app/api/auth/register/route.ts';
import { POST as logout } from '../app/api/auth/logout/route.ts';
import { POST as changePassword } from '../app/api/auth/password/route.ts';
import { POST as submit } from '../app/api/demandes/route.ts';
import { GET as getContents,POST as save,DELETE as deleteContent } from '../app/api/admin/contenus/route.ts';
import { POST as uploadImage } from '../app/api/admin/images/route.ts';
import { GET as getImage } from '../app/media-images/[id]/route.ts';
import { GET as getRequests,PATCH as updateRequest } from '../app/api/admin/demandes/route.ts';
import { GET as getUsers,POST as createUser,PATCH as updateUser,DELETE as deleteUser } from '../app/api/admin/users/route.ts';
import { GET as getSettings,PUT as putSettings } from '../app/api/admin/settings/route.ts';
import { GET as getAudit } from '../app/api/admin/audit/route.ts';
import { defaultSettings,redirectDestination } from '../lib/settings.ts';
import robots from '../app/robots.ts';
import sitemap from '../app/sitemap.ts';
import CataloguePage from '../app/catalogue/catalogue-page.tsx';
import DetailPage from '../app/experiences/[slug]/page.tsx';
import Viewer from '../app/viewer.tsx';
const password='Long-test-password-2026!';
let admin,editor,viewer,other,adminCookie,editorCookie,viewerCookie,otherCookie;
const request=(body,{cookie='',method='POST',path='/api/demandes',origin=process.env.SITE_URL,headers={}}={})=>new Request(process.env.SITE_URL+path,{method,headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie,...headers},...(method==='GET'?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
const get=(cookie,path='/api/admin/demandes')=>request(null,{cookie,path,method:'GET'});
const imageRequest=(body,{cookie='',origin=process.env.SITE_URL,type='image/png'}={})=>new Request(process.env.SITE_URL+'/api/admin/images',{method:'POST',headers:{'Content-Type':type,Origin:origin,Cookie:cookie},body});
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWMQqdjyH4QZYAwASvQI/eVH7P4AAAAASUVORK5CYII=','base64');
const valid=(extra={})=>({id:crypto.randomUUID(),name:'Client Test',email:'lead-'+crypto.randomUUID()+'@example.test',organization:'École Test',intent:'demonstration',message:'Une démonstration pour notre groupe de test.',consent:true,website:'',...extra});
const count=async(table)=>Number((await db.query('SELECT count(*) AS n FROM '+table)).rows[0].n);
const fixture=async(role,email)=>{const id=await provisionUser(email,role,role,password);return [id,cookieHeader(await createSession(id))]};
await test('Drizzle migrations apply to isolated PostgreSQL and are repeatable',async()=>{
 await migrate();await migrate();
 assert.equal(await count('visuaa_migrations'),readdirSync(new URL('../drizzle/postgres/',import.meta.url)).filter(f=>f.endsWith('.sql')).length);
 for(const table of ['users','sessions','fiches','media','uploaded_images','points_of_interest','requests','audit_log','settings','rate_limits'])assert.equal(await count(table),0);
});
await test('explicit seed creates 168 profiles without overwriting content',async()=>{
 await seedContent(seed);await seedContent(seed);assert.equal(await count('fiches'),168);
 const items=await listContent();assert.equal(items.filter(e=>e.kind==='metier').length,145);assert.equal(items.filter(e=>e.kind==='destination').length,22);
 const demo=await contentBySlug('premiers-pas-en-360');assert.equal(demo.points.length,2);assert.equal(demo.mediaUrl,'/images/panorama.jpg');
 for(const e of items)assert.equal(experienceInput.safeParse(e).success,true,e.slug);
});
await test('fixtures create database users and opaque hashed sessions',async()=>{
 [admin,adminCookie]=await fixture('admin','admin@visuaa.test');[editor,editorCookie]=await fixture('editor','editor@visuaa.test');[viewer,viewerCookie]=await fixture('viewer','viewer@visuaa.test');[other,otherCookie]=await fixture('viewer','other@visuaa.test');
 const row=(await db.query('SELECT password_hash FROM users WHERE id=$1',[admin])).rows[0];assert.ok(!row.password_hash.includes(password));assert.ok(await verifyPassword(password,row.password_hash));
 assert.equal((await getUser(get(adminCookie))).role,'admin');assert.equal((await db.query('SELECT token_hash FROM sessions LIMIT 1')).rows[0].token_hash.length,64);
});
await test('forged legacy identity headers never grant access',async()=>{
 const req=get('','/api/admin/users');req.headers.set('oai-authenticated-user-id',admin);req.headers.set('oai-authenticated-user-email','admin@visuaa.test');
 assert.equal((await getUsers(req)).status,401);assert.equal((await getContents(req)).status,401);
});
await test('permission matrix rejects editor administration and viewer writes',async()=>{
 for(const handler of [getUsers,getSettings,getAudit])assert.equal((await handler(get(editorCookie))).status,403);
 assert.equal((await save(request({}, {cookie:viewerCookie}))).status,403);
 assert.equal((await createUser(request({},{cookie:editorCookie}))).status,403);
 assert.equal((await updateRequest(request({},{cookie:editorCookie,method:'PATCH'}))).status,403);
 assert.equal(can(await getUser(get(viewerCookie)),'content:publish'),false);
});
await test('image upload validates access and serves an optimized immutable asset',async()=>{
 assert.equal((await uploadImage(imageRequest(pixel,{cookie:viewerCookie}))).status,403);
 assert.equal((await uploadImage(imageRequest(pixel,{cookie:adminCookie,origin:'https://attacker.example'}))).status,403);
 assert.equal((await uploadImage(imageRequest(pixel,{cookie:adminCookie,type:'text/plain'}))).status,415);
 assert.equal((await uploadImage(imageRequest(Buffer.from('not an image'),{cookie:adminCookie}))).status,400);
 const response=await uploadImage(imageRequest(pixel,{cookie:adminCookie}));assert.equal(response.status,201);
 const uploaded=await response.json();assert.match(uploaded.url,/^\/media-images\/[0-9a-f-]{36}$/);assert.equal(uploaded.mimeType,'image/webp');
 const id=uploaded.url.split('/').pop(),served=await getImage(new Request(process.env.SITE_URL+uploaded.url),{params:Promise.resolve({id})});
 assert.equal(served.status,200);assert.equal(served.headers.get('content-type'),'image/webp');assert.match(served.headers.get('cache-control'),/immutable/);assert.ok((await served.arrayBuffer()).byteLength>0);
});
await test('registration ignores requested role and reserves bootstrap addresses',async()=>{
 const response=await register(request({name:'New client',email:'new@example.test',password,role:'admin'}));assert.equal(response.status,201);
 assert.match(response.headers.get('set-cookie'),/HttpOnly/);assert.match(response.headers.get('set-cookie'),/Secure/);
 assert.equal((await getUser(get(response.headers.get('set-cookie')))).role,'viewer');
 assert.equal((await register(request({name:'Fake owner',email:'admin@visuaa.test',password}))).status,409);
});
await test('password login rejects errors and grants a revocable session',async()=>{
 assert.equal((await login(request({email:'admin@visuaa.test',password:'Incorrect-password-123'}))).status,401);
 const r=await login(request({email:'admin@visuaa.test',password}));assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');assert.equal((await getUsers(get(cookie))).status,200);
 assert.equal((await logout(request({},{cookie}))).status,200);assert.equal(await getUser(get(cookie)),null);
});
await test('origin, content type, malformed JSON and bounded body are enforced',async()=>{
 assert.equal((await submit(request(valid(),{origin:'https://attacker.example'}))).status,403);
 assert.equal((await submit(request(valid(),{headers:{'Content-Type':'text/plain'}}))).status,415);
 assert.equal((await submit(request('{bad'))).status,400);
 assert.equal((await submit(request('x'.repeat(61000)))).status,413);
 assert.equal((await submit(request(valid({email:'bad'})))).status,400);
 assert.equal((await submit(request(valid({consent:false})))).status,400);
 assert.equal((await submit(request(valid({website:'bot'})))).status,400);
});
let clientLead,anonymousLead;
await test('requests persist and bind exclusively to the current session',async()=>{
 clientLead=valid({email:'viewer@visuaa.test',userId:other,ficheId:'demo360'});
 const r=await submit(request(clientLead,{cookie:viewerCookie}));assert.equal(r.status,201);assert.match((await r.json()).reference,/^VIS-/);
 assert.equal((await db.query('SELECT user_id FROM requests WHERE id=$1',[clientLead.id])).rows[0].user_id,viewer);
 anonymousLead=valid({email:'viewer@visuaa.test'});assert.equal((await submit(request(anonymousLead))).status,201);
 assert.equal((await (await getRequests(get(viewerCookie))).json()).total,1);
 assert.equal((await (await getRequests(get(otherCookie))).json()).total,0);
});
await test('identical request retries are idempotent and altered UUID payloads conflict',async()=>{
 const n=await count('requests');assert.equal((await submit(request(clientLead,{cookie:viewerCookie}))).status,200);
 assert.equal((await submit(request({...clientLead,message:'Different sufficiently long message'},{cookie:viewerCookie}))).status,409);assert.equal(await count('requests'),n);
});
await test('prepared queries preserve adversarial messages as data',async()=>{
 const d=valid({message:"<script>alert(1)</script> Robert'); DROP TABLE users; --"});
 assert.equal((await submit(request(d))).status,201);assert.equal((await db.query('SELECT message FROM requests WHERE id=$1',[d.id])).rows[0].message,d.message);assert.ok(await count('users')>=4);
});
let draft;
await test('editor creates a draft with relational media and submits for review',async()=>{
 draft={...seed[2],id:crypto.randomUUID(),slug:'qa-project',title:'Projet de test',kind:'projet',version:0,status:'draft'};
 let r=await save(request(draft,{cookie:editorCookie}));assert.equal(r.status,200);draft=(await r.json()).item;
 assert.equal(draft.authorId,editor);assert.equal(await contentBySlug(draft.slug),null);assert.equal(draft.points.length,2);
 r=await save(request({...draft,status:'review'},{cookie:editorCookie}));assert.equal(r.status,200);draft=(await r.json()).item;
 assert.equal((await save(request({...draft,status:'published'},{cookie:editorCookie}))).status,403);
});
await test('administrator replaces the presentation image attached to a fiche',async()=>{
 const first=await (await uploadImage(imageRequest(pixel,{cookie:adminCookie}))).json();
 let response=await save(request({...draft,image:first.url},{cookie:adminCookie}));assert.equal(response.status,200);draft=(await response.json()).item;
 assert.equal((await db.query('SELECT fiche_id FROM uploaded_images WHERE id=$1',[first.url.split('/').pop()])).rows[0].fiche_id,draft.id);
 const second=await (await uploadImage(imageRequest(pixel,{cookie:adminCookie}))).json();
 response=await save(request({...draft,image:second.url},{cookie:adminCookie}));assert.equal(response.status,200);draft=(await response.json()).item;
 assert.equal((await getImage(new Request(process.env.SITE_URL+first.url),{params:Promise.resolve({id:first.url.split('/').pop()})})).status,404);
 assert.equal(Number((await db.query('SELECT count(*) AS n FROM uploaded_images WHERE fiche_id=$1',[draft.id])).rows[0].n),1);
});
await test('publication validates credits, rights, URL protocols and text alternative',async()=>{
 assert.equal((await save(request({...draft,status:'published',isDemo:false,rightsConfirmed:false},{cookie:adminCookie}))).status,400);
 assert.equal((await save(request({...draft,image:'javascript:alert(1)'},{cookie:adminCookie}))).status,400);
 assert.equal((await save(request({...draft,status:'published',transcript:''},{cookie:adminCookie}))).status,400);
});
await test('administrator publishes and editor sees only requests tied to authored fiches',async()=>{
 const verified=await save(request({...draft,status:'verified'},{cookie:adminCookie}));assert.equal(verified.status,200);draft=(await verified.json()).item;
 const r=await save(request({...draft,status:'published'},{cookie:adminCookie}));assert.equal(r.status,200);draft=(await r.json()).item;
 assert.ok(await contentBySlug(draft.slug));
 assert.equal((await submit(request(valid({ficheId:draft.id})))).status,201);
 const d=await (await getRequests(get(editorCookie))).json();assert.equal(d.total,1);assert.equal(d.items[0].fiche_id,draft.id);
 assert.equal((await save(request({...draft,status:'draft'},{cookie:editorCookie}))).status,403);
});
await test('concurrent stale saves cannot silently overwrite a newer version',async()=>{
 const results=await Promise.all([save(request({...draft,title:'Concurrent A'},{cookie:adminCookie})),save(request({...draft,title:'Concurrent B'},{cookie:adminCookie}))]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);draft=(await results.find(r=>r.status===200).json()).item;
 assert.equal((await save(request({...draft,slug:'changed-slug'},{cookie:adminCookie}))).status,409);
});
await test('audit insert failure rolls back content mutation and related media',async()=>{
 const prior=await contentBySlug(draft.slug);
 setTestDatabase({...db,transaction:work=>db.transaction(tx=>work({query:(text,values)=>{if(text.startsWith('INSERT INTO audit_log'))throw new Error('Injected audit failure');return tx.query(text,values)}}))});
 try{assert.equal((await save(request({...draft,title:'Should roll back'},{cookie:adminCookie}))).status,503)}finally{setTestDatabase(db)}
 assert.deepEqual(await contentBySlug(draft.slug),prior);
});
await test('archival removes a fiche from public queries and rejects new linked requests',async()=>{
 const r=await save(request({...draft,status:'archived'},{cookie:adminCookie}));assert.equal(r.status,200);draft=(await r.json()).item;
 assert.equal(await contentBySlug(draft.slug),null);assert.equal((await submit(request(valid({ficheId:draft.id})))).status,400);
 assert.equal((await deleteContent(request({id:draft.id,version:draft.version},{cookie:adminCookie,method:'DELETE'}))).status,409);
});
await test('draft deletion cascades its media and points and is admin-only',async()=>{
 const r=await save(request({...draft,status:'draft'},{cookie:adminCookie}));draft=(await r.json()).item;
 assert.equal((await deleteContent(request({id:draft.id,version:draft.version},{cookie:editorCookie,method:'DELETE'}))).status,403);
 assert.equal((await deleteContent(request({id:draft.id,version:draft.version},{cookie:adminCookie,method:'DELETE'}))).status,200);
 assert.equal(Number((await db.query('SELECT count(*) AS n FROM media WHERE fiche_id=$1',[draft.id])).rows[0].n),0);
});
await test('admin manages request status and deletes personal data',async()=>{
 assert.equal((await updateRequest(request({id:clientLead.id,status:'contacted'},{cookie:adminCookie,method:'PATCH'}))).status,200);
 assert.equal((await db.query('SELECT status FROM requests WHERE id=$1',[clientLead.id])).rows[0].status,'contacted');
 const contacted=await(await getRequests(get(viewerCookie,'/api/admin/demandes?status=contacted'))).json();
 assert.equal(contacted.total,1);assert.equal(contacted.items[0].id,clientLead.id);
 assert.equal((await(await getRequests(get(otherCookie,'/api/admin/demandes?status=contacted'))).json()).total,0);
 assert.equal((await(await getRequests(get(viewerCookie,'/api/admin/demandes?status=new'))).json()).total,0);
 assert.equal((await getRequests(get(adminCookie,'/api/admin/demandes?status=invalid'))).status,400);
 assert.equal((await updateRequest(request({id:clientLead.id,status:'deleted'},{cookie:adminCookie,method:'PATCH'}))).status,200);
 assert.equal((await db.query('SELECT id FROM requests WHERE id=$1',[clientLead.id])).rowCount,0);
});
await test('request pagination preserves access after twenty records',async()=>{
 for(let i=0;i<22;i++){const d=valid();await db.query('INSERT INTO requests(id,name,email,intent,message,fingerprint) VALUES($1,$2,$3,$4,$5,$6)',[d.id,d.name,d.email,d.intent,d.message,'fixture'])}
 const first=await(await getRequests(get(adminCookie))).json(),second=await(await getRequests(get(adminCookie,'/api/admin/demandes?page=2'))).json();
 assert.equal(first.items.length,20);assert.ok(second.items.length);assert.ok(!first.items.some(a=>second.items.some(b=>a.id===b.id)));
});
await test('email rate limit rejects the sixth request in a bucket',async()=>{
 await db.query('DELETE FROM rate_limits');for(let i=0;i<5;i++)assert.equal((await submit(request(valid({email:'limit@example.test'})))).status,201);
 assert.equal((await submit(request(valid({email:'limit@example.test'})))).status,429);
});
await test('last admin cannot be demoted or disabled',async()=>{
 assert.equal((await updateUser(request({id:admin,role:'viewer',status:'active'},{cookie:adminCookie,method:'PATCH'}))).status,409);
 assert.equal((await updateUser(request({id:admin,role:'admin',status:'disabled'},{cookie:adminCookie,method:'PATCH'}))).status,409);
});
await test('role changes and disabled accounts invalidate existing sessions',async()=>{
 assert.equal((await updateUser(request({id:other,role:'editor',status:'active'},{cookie:adminCookie,method:'PATCH'}))).status,200);assert.equal(await getUser(get(otherCookie)),null);
 const cookie=cookieHeader(await createSession(other));
 assert.equal((await updateUser(request({id:other,role:'editor',status:'disabled'},{cookie:adminCookie,method:'PATCH'}))).status,200);assert.equal(await getUser(get(cookie)),null);
});
await test('account password change verifies current password and revokes all sessions',async()=>{
 assert.equal((await changePassword(request({current:'bad',password:'Changed-long-password!'},{cookie:viewerCookie}))).status,400);
 assert.equal((await changePassword(request({current:password,password:'Changed-long-password!'},{cookie:viewerCookie}))).status,200);assert.equal(await getUser(get(viewerCookie)),null);
});
await test('user management creates roles, hides password hashes and removes accounts',async()=>{
 const r=await createUser(request({email:'managed@example.test',name:'Managed user',password,role:'editor'},{cookie:adminCookie}));assert.equal(r.status,201);const {id}=await r.json();
 const rows=await(await getUsers(get(adminCookie))).json();assert.ok(rows.items.every(u=>!('password_hash'in u)));
 assert.equal((await deleteUser(request({id},{cookie:adminCookie,method:'DELETE'}))).status,200);
});
await test('settings validate public destinations, block reserved routes, and resolve WordPress paths',async()=>{
 assert.equal((await putSettings(request({...defaultSettings,redirects:[{source:'/ancienne-page',destination:'/catalogue'}]},{cookie:adminCookie,method:'PUT'}))).status,200);
 const value=await(await getSettings(get(adminCookie))).json();assert.equal(redirectDestination('/ancienne-page/',value),'/catalogue');
 for(const redirects of [[{source:'/admin',destination:'/catalogue'}],[{source:'/ancien',destination:'/introuvable'}],[{source:'/a',destination:'/b'},{source:'/b',destination:'/a'}]])assert.equal((await putSettings(request({...defaultSettings,redirects},{cookie:adminCookie,method:'PUT'}))).status,400);
});
await test('public SEO uses SITE_URL and excludes private content from sitemap',async()=>{
 process.env.SITE_PUBLIC='true';const entries=await sitemap();assert.ok(entries.some(e=>e.url.endsWith('/experiences/premiers-pas-en-360')));assert.ok(entries.every(e=>!e.url.includes('/admin')&&!e.url.includes('/dashboard')));
 assert.equal(robots().rules.allow,'/');assert.equal(pageMetadata('/metiers','Métiers','Description').alternates.canonical,'https://visuaa.test/metiers');
 process.env.SITE_PUBLIC='false';assert.equal(robots().rules.disallow,'/');
 const json=ficheJsonLd(seed[2]);assert.equal(json['@type'],'Article');assert.ok(!safeJsonLd({x:'</script><script>bad</script>'}).includes('<'));
});
await test('catalogue filters and pagination work before client JavaScript',async()=>{
 const items=await listContent();assert.equal(filterCatalogue(items,{domaine:'agriculture'},'metier').total,50);
 assert.equal(filterCatalogue(items,{q:'fish farmer'}).total,1);
 assert.equal(filterCatalogue(items,{type:'demo'}).total,1);
 const a=filterCatalogue(items,{page:'1'}),b=filterCatalogue(items,{page:'2'});assert.equal(a.items.length,12);assert.ok(a.items.every(e=>!b.items.some(x=>x.id===e.id)));
 const markup=renderToStaticMarkup(await CataloguePage({params:{q:'fish farmer'}}));assert.match(markup,/Pisciculteur/);assert.match(markup,/method="get"/);
});
await test('public detail renders media launch, textual fallback and linked contact CTA',async()=>{
 context.locale='fr';
 const markup=renderToStaticMarkup(await DetailPage({params:Promise.resolve({slug:'premiers-pas-en-360'})}));
 assert.match(markup,/Alternative textuelle/);assert.match(markup,/fiche=demo360/);assert.match(markup,/application\/ld\+json/);assert.match(markup,/Explorer en 360/);
 const launcher=renderToStaticMarkup(createElement(Viewer,{experience:seed[2]}));assert.ok(!launcher.includes('<canvas'));
 assert.ok(!readFileSync(new URL('../app/viewer.tsx',import.meta.url),'utf8').includes("from 'three'"));
});
await test('audit logs mutations without copying request payloads',async()=>{
 const result=await(await getAudit(get(adminCookie))).json();assert.ok(result.total>5);assert.ok(result.items.every(r=>!('message'in r)&&!('password_hash'in r)&&!('email'in r)));
});
await sql.close();
