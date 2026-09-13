import { provisionUser } from '../lib/auth';
import { database } from '../db/client';
import { z } from 'zod';
const password=process.env.ADMIN_BOOTSTRAP_PASSWORD;
if(!password||password.length<12||password.length>128)throw new Error('ADMIN_BOOTSTRAP_PASSWORD doit contenir de 12 à 128 caractères.');
const admins=(process.env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
if(!admins.length)throw new Error('Renseignez ADMIN_EMAILS.');
const editors=(process.env.EDITOR_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).filter(e=>!admins.includes(e));
try {for(const [emails,role] of [[admins,'admin'],[editors,'editor']] as const)for(const email of new Set(emails)){
 z.string().email().parse(email);
 if((await (await database()).query('SELECT id FROM users WHERE email=$1',[email])).rowCount){console.log('Compte existant conservé.');continue}
 await provisionUser(email,role==='admin'?'Administrateur':'Éditeur',role,password);console.log('Compte initial créé.');
}}finally{await (await database()).close()}
