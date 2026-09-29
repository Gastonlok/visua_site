import { randomUUID } from 'node:crypto';
import { database, type SqlConnection } from './client';
import type { Experience } from '../lib/models';
import { withCatalogueMetadata } from '../lib/catalogue-metadata';
import { HttpError, demand, type User } from '../lib/permissions';
type FicheRow = { id: string; slug: string; type: Experience['kind']; title: string; summary: string; body: string; status: Experience['status']; author_id: string | null; seo_title: string; seo_description: string; metadata: Partial<Experience>; version: number; updated_at: string | Date };
type MediaRow = { fiche_id: string; url: string; type: string; credits: string; source: string; alt: string };
type PointRow = { fiche_id: string; label: string; description: string; yaw: number; pitch: number };
export async function audit(tx: SqlConnection, actor: string | null, action: string, target: string) {
 await tx.query('INSERT INTO audit_log (id,user_id,action,target) VALUES ($1,$2,$3,$4)', [randomUUID(), actor, action, target]);
}
async function hydrate(rows: FicheRow[], tx: SqlConnection): Promise<Experience[]> {
 if (!rows.length) return [];
 const ids = rows.map(r => r.id);
 const media = (await tx.query<MediaRow>('SELECT * FROM media WHERE fiche_id = ANY($1::text[]) ORDER BY position', [ids])).rows;
 const points = (await tx.query<PointRow>('SELECT * FROM points_of_interest WHERE fiche_id = ANY($1::text[]) ORDER BY position', [ids])).rows;
 return rows.map(r => {
  const poster = media.find(m => m.fiche_id === r.id && m.type === 'image');
  const immersive = media.find(m => m.fiche_id === r.id && m.type !== 'image');
  return withCatalogueMetadata({ category: '', sector: '', location: '', duration: '', capturedAt: '', transcript: '', skills: [], isDemo: true, rightsConfirmed: false,
   ...r.metadata, id: r.id, slug: r.slug, kind: r.type, title: r.title, description: r.summary, body: r.body, status: r.status,
   authorId: r.author_id, seoTitle: r.seo_title, seoDescription: r.seo_description,
   version: r.version, updatedAt: new Date(r.updated_at).toISOString(),
   image: poster?.url || '', imageAlt: poster?.alt || '', imageCredit: poster?.credits || '', imageSource: poster?.source || '',
   format: (immersive?.type || 'text') as Experience['format'], mediaUrl: immersive?.url || '', mediaCredit: immersive?.credits || '', mediaSource: immersive?.source || '',
   points: points.filter(p => p.fiche_id === r.id).map(p => ({ title: p.label, text: p.description, yaw: p.yaw, pitch: p.pitch })),
  });
 });
}
export async function listContent(all = false) {
 const db = await database();
 return hydrate((await db.query<FicheRow>(all ? 'SELECT * FROM fiches ORDER BY created_at,id' : "SELECT * FROM fiches WHERE status='published' ORDER BY created_at,id")).rows, db);
}
export async function contentBySlug(slug: string) {
 const db = await database();
 return (await hydrate((await db.query<FicheRow>("SELECT * FROM fiches WHERE slug=$1 AND status='published'", [slug])).rows, db))[0] || null;
}
async function replaceMedia(tx: SqlConnection, e: Experience) {
 await tx.query('DELETE FROM media WHERE fiche_id=$1', [e.id]);
 await tx.query('DELETE FROM points_of_interest WHERE fiche_id=$1', [e.id]);
 if (e.image) await tx.query('INSERT INTO media (id,fiche_id,url,type,credits,source,alt,position) VALUES ($1,$2,$3,$4,$5,$6,$7,0)', [randomUUID(), e.id, e.image, 'image', e.imageCredit, e.imageSource, e.imageAlt || e.title]);
 if (e.format !== 'text') await tx.query('INSERT INTO media (id,fiche_id,url,type,credits,source,alt,position) VALUES ($1,$2,$3,$4,$5,$6,$7,1)', [randomUUID(), e.id, e.mediaUrl, e.format, e.mediaCredit, e.mediaSource, e.transcript]);
 for (const [i, p] of e.points.entries()) await tx.query('INSERT INTO points_of_interest (id,fiche_id,label,description,yaw,pitch,position) VALUES ($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), e.id, p.title, p.text, p.yaw, p.pitch, i]);
}
function uploadedImageId(url: string) { return /^\/media-images\/([0-9a-f-]{36})$/i.exec(url)?.[1] || null; }
function mediaAssetId(url: string) { return /^\/media-files\/([0-9a-f-]{36})$/i.exec(url)?.[1] || null; }
async function validateMediaAssets(tx:SqlConnection,e:Experience){
 const videoId=mediaAssetId(e.mediaUrl),attachments=e.attachments||[],ids=[...(videoId?[videoId]:[]),...attachments.map(item=>item.assetId)];if(!ids.length)return;
 const rows=(await tx.query<{id:string;kind:string;mime_type:string;byte_size:number}>("SELECT id,kind,mime_type,byte_size FROM media_assets WHERE id=ANY($1::text[]) AND status='ready'",[ids])).rows,map=new Map(rows.map(row=>[row.id,row]));
 if(videoId&&map.get(videoId)?.kind!=='video')throw new HttpError(400,'La vidéo sélectionnée est introuvable ou invalide.');
 for(const attachment of attachments){const row=map.get(attachment.assetId);if(!row||row.kind!=='document'||row.mime_type!==attachment.mimeType||row.byte_size!==attachment.size||attachment.url!=='/media-files/'+attachment.assetId)throw new HttpError(400,'Un document joint est introuvable ou invalide.');}
}
async function attachUploadedImage(tx: SqlConnection, e: Experience) {
 const id=uploadedImageId(e.image);
 if(id){
  const linked=await tx.query('UPDATE uploaded_images SET fiche_id=$1 WHERE id=$2 AND (fiche_id IS NULL OR fiche_id=$1)',[e.id,id]);
  if(!linked.rowCount)throw new HttpError(400,'Image téléversée introuvable ou déjà utilisée par une autre fiche.');
  await tx.query('DELETE FROM uploaded_images WHERE fiche_id=$1 AND id<>$2',[e.id,id]);
 }else await tx.query('DELETE FROM uploaded_images WHERE fiche_id=$1',[e.id]);
}
function metadata(e: Experience) {
 const copy: Partial<Experience> = { ...e };
 for (const key of ['id','slug','title','description','body','status','authorId','seoTitle','seoDescription','image','imageCredit','imageSource','imageAlt','mediaUrl','mediaCredit','mediaSource','points','version','updatedAt'] as const) delete copy[key];
 return JSON.stringify(copy);
}
export async function saveContent(e: Experience, actor: User) {
 demand(actor, 'content:write');
 return (await database()).transaction(async tx => {
  const old = (await tx.query<FicheRow>('SELECT * FROM fiches WHERE id=$1 FOR UPDATE', [e.id])).rows[0];
  if (actor.role !== 'admin' && (['verified','published','archived'].includes(e.status) || (old && ['verified','published','archived'].includes(old.status)))) throw new HttpError(403, 'Seul un administrateur peut modifier, publier ou archiver un contenu publié.');
  if (old && (old.version !== e.version || old.slug !== e.slug)) throw new HttpError(409, 'Ce contenu a changé. Rechargez avant de l’enregistrer.');
  const transitions: Record<Experience['status'],Experience['status'][]>={draft:['draft','review'],review:['draft','review','verified'],verified:['draft','verified','published'],published:['published','archived'],archived:['archived','draft']};
  if(!transitions[old?.status||'draft'].includes(e.status))throw new HttpError(409,'Respectez les étapes : brouillon, à vérifier, vérifié, publié, archivé.');
  if (!old && e.version !== 0) throw new HttpError(409, 'Contenu introuvable ou version périmée.');
  if ((await tx.query('SELECT id FROM fiches WHERE slug=$1 AND id<>$2', [e.slug,e.id])).rowCount) throw new HttpError(409, 'Cette adresse existe déjà.');
  await validateMediaAssets(tx,e);
  if (old) {
   await tx.query('UPDATE fiches SET title=$1,summary=$2,body=$3,type=$4,status=$5,metadata=$6,seo_title=$7,seo_description=$8,version=version+1,updated_at=now() WHERE id=$9',
    [e.title,e.description,e.body,e.kind,e.status,metadata(e),e.seoTitle || '',e.seoDescription || '',e.id]);
  } else {
   await tx.query('INSERT INTO fiches (id,slug,title,summary,body,type,status,metadata,author_id,seo_title,seo_description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [e.id,e.slug,e.title,e.description,e.body,e.kind,e.status,metadata(e),actor.id,e.seoTitle || '',e.seoDescription || '']);
  }
  await replaceMedia(tx,e);
  await attachUploadedImage(tx,e);
  await audit(tx,actor.id,'content:'+e.status,e.id);
  return (await hydrate((await tx.query<FicheRow>('SELECT * FROM fiches WHERE id=$1',[e.id])).rows,tx))[0];
 });
}
export async function deleteContent(id: string, version: number, actor: User) {
 demand(actor,'content:delete');
 await (await database()).transaction(async tx => {
  const row=(await tx.query<FicheRow>('SELECT * FROM fiches WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if (!row) throw new HttpError(404,'Fiche introuvable.');
  if (row.version !== version) throw new HttpError(409,'Rechargez la fiche avant suppression.');
  if (row.status !== 'draft') throw new HttpError(409,'Seuls les brouillons peuvent être supprimés. Archivez les autres contenus.');
  await tx.query('DELETE FROM fiches WHERE id=$1',[id]); await audit(tx,actor.id,'content:delete',id);
 });
}
export async function seedContent(entries: Experience[]) {
 const db=await database();
 await db.transaction(async tx => { for (const e of entries) {
  const result=await tx.query('INSERT INTO fiches (id,slug,title,summary,body,type,status,metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING RETURNING id',[e.id,e.slug,e.title,e.description,e.body,e.kind,e.status,metadata(e)]);
  if (result.rowCount) await replaceMedia(tx,e);
 }});
}
