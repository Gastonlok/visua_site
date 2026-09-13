import {test,expect} from '@playwright/test';
test('sensitive forms cannot submit credentials in URLs without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 const page=await context.newPage();
 for(const path of ['/connexion','/inscription','/contact']){
  await page.goto(path);
  await expect(page.locator('form')).toHaveAttribute('method','post');
  await expect(page.locator('form button[type=submit],form button').last()).toBeDisabled();
  await expect(page.getByText('JavaScript est nécessaire',{exact:false})).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
 }
 const response=await page.request.post('/api/form-unavailable',{form:{password:'FICTIF-TEST-UNIQUEMENT'}});
 expect(response.status()).toBe(400);expect(await response.text()).not.toContain('FICTIF');
 await context.close();
});
