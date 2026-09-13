import type { NextConfig } from 'next';
const config: NextConfig = { distDir:process.env.VISUA_TEST_DATABASE&&process.env.NODE_ENV!=='production'?'.next-e2e':'.next', poweredByHeader: false, serverExternalPackages: ['pg','@electric-sql/pglite'], devIndicators: false };
export default config;
