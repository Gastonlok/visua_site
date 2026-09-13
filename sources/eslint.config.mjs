import { defineConfig,globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
 ...nextVitals,...nextTs,
 globalIgnores(['.next/**','node_modules/**','.pnpm-store/**','.sites-runtime/**','.local-db/**','test-results/**','playwright-report/**','build/**','next-env.d.ts']),
 {rules:{
  // Native document navigation is intentional: language and session state are read on each SSR request.
  '@next/next/no-html-link-for-pages':'off',
 }},
 {files:['components/ui/**/*.{ts,tsx}','hooks/use-mobile.ts'],rules:{'@typescript-eslint/no-unused-vars':'off','react-hooks/purity':'off','react-hooks/set-state-in-effect':'off'}},
 {files:['app/immersive.tsx','app/admin/panel.tsx','app/dashboard/workspace.tsx'],rules:{
  // These effects synchronize an external WebGL lifecycle or fetched API state.
  'react-hooks/set-state-in-effect':'off',
 }},
]);
