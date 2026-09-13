import { seed } from '../lib/seed';
import { seedContent } from '../db/repository';
import { database } from '../db/client';
try { await seedContent(seed);console.log('Catalogue initial importé, contenus existants conservés.'); } finally { await (await database()).close(); }
