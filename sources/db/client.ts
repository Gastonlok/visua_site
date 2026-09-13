import { Pool } from 'pg';
export type Row = Record<string, unknown>;
export interface SqlConnection { query<T = Row>(sql: string, values?: unknown[]): Promise<{ rows: T[]; rowCount: number }> }
export interface Database extends SqlConnection { transaction<T>(work: (tx: SqlConnection) => Promise<T>): Promise<T>; close(): Promise<void> }
const state=globalThis as typeof globalThis & {visuaaDatabase?: Database;visuaaDatabasePromise?: Promise<Database>};

export function setTestDatabase(db: Database) {
 if (process.env.NODE_ENV !== 'test') throw new Error('Adaptateur de test interdit hors tests.');
 state.visuaaDatabase = db;
}
function wrap(connection: Pick<Pool, 'query'>): SqlConnection {
 return { async query<T>(sql: string, values: unknown[] = []) {
  const result = await connection.query(sql, values);
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
 }};
}
export async function database(): Promise<Database> {
 if (state.visuaaDatabase) return state.visuaaDatabase;
 if (state.visuaaDatabasePromise) return state.visuaaDatabasePromise;
 state.visuaaDatabasePromise = (async () => {
  if (process.env.VISUA_TEST_DATABASE && process.env.NODE_ENV !== 'production') {
   const { PGlite } = await import('@electric-sql/pglite');
   const pg = new PGlite(process.env.VISUA_TEST_DATABASE);
   const adapt = (p: Pick<typeof pg, 'query'>): SqlConnection => ({ async query<T>(sql: string, values: unknown[] = []) {
    const r = await p.query<T>(sql, values); return { rows: r.rows, rowCount: r.affectedRows || r.rows.length };
   }});
   return { ...adapt(pg), transaction: <T>(work: (tx: SqlConnection) => Promise<T>) => pg.transaction(tx => work(adapt(tx))), close: () => pg.close() };
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL manquante.');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
  return { ...wrap(pool), async transaction<T>(work: (tx: SqlConnection) => Promise<T>) {
   const connection = await pool.connect();
   try { await connection.query('BEGIN'); const value = await work(wrap(connection)); await connection.query('COMMIT'); return value; }
   catch (error) { await connection.query('ROLLBACK'); throw error; } finally { connection.release(); }
  }, close: () => pool.end() };
 })();
 try { state.visuaaDatabase = await state.visuaaDatabasePromise; return state.visuaaDatabase; } finally { state.visuaaDatabasePromise = undefined; }
}
