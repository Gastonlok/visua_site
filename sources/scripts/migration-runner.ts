import { readFileSync,readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { database } from '../db/client';
export async function migrate() {
 const db=await database();
 await db.query('CREATE TABLE IF NOT EXISTS visuaa_migrations (name text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
 for(const name of readdirSync(new URL('../drizzle/postgres/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort()) {
  const sql=readFileSync(new URL('../drizzle/postgres/'+name,import.meta.url),'utf8'),hash=createHash('sha256').update(sql).digest('hex');
  await db.transaction(async tx=>{
   await tx.query('LOCK TABLE visuaa_migrations IN EXCLUSIVE MODE');
   const old=(await tx.query<{hash:string}>('SELECT hash FROM visuaa_migrations WHERE name=$1',[name])).rows[0];
   if(old){if(old.hash!==hash)throw new Error('Migration modifiée après application : '+name);return}
   for(const statement of sql.split('--> statement-breakpoint').filter(s=>s.trim()))await tx.query(statement);
   await tx.query('INSERT INTO visuaa_migrations (name,hash) VALUES ($1,$2)',[name,hash]);
  });
 }
}
