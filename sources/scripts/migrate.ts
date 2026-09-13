import { migrate } from './migration-runner';
import { database } from '../db/client';
try { await migrate(); console.log('Migrations appliquées.'); } finally { await (await database()).close(); }
