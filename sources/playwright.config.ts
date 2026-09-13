import { defineConfig,devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',timeout:60000,expect:{timeout:15000},workers:1,fullyParallel:false,
 use:{baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome'],channel:process.platform==='win32'?'msedge':undefined}}],
 webServer:{command:'node --import ./scripts/register.mjs scripts/e2e-server.ts',url:'http://127.0.0.1:3100/connexion',timeout:180000,reuseExistingServer:false},
});
