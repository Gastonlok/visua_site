import {test,expect} from '@playwright/test';
import {careerHeroes,territoryHeroes} from '../../lib/section-heroes';
test.setTimeout(180000);

test('each themed catalogue opens its matching hero and preserves territory filters',async({page})=>{
 for(const [kind,heroes]of [['metiers',careerHeroes],['destinations',territoryHeroes]] as const){
  for(const [key,hero]of Object.entries(heroes)){
   await page.goto('/'+kind+'?'+(kind==='metiers'?'domaine':'famille')+'='+key);
   await expect(page.getByRole('heading',{level:1})).toHaveText(hero.title);
   const image=page.locator('.section-hero img');
   await expect(image).toHaveAttribute('alt',hero.alt);
   await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
 }
 await page.getByRole('button',{name:'Filtrer',exact:true}).click();
 await expect(page).toHaveURL(/famille=patrimoine/);
 await expect(page.getByRole('heading',{level:1})).toHaveText(territoryHeroes.patrimoine.title);
});

test('children and other menu pages have an image hero on desktop and mobile',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const path of ['/metiers/enfants','/destinations/enfants','/catalogue','/ressources','/organisations','/offres','/contact','/actualite','/actualite?theme=metiers','/actualite?theme=territoires']){
   await page.goto(path);
   await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
   const hero=page.locator('.section-hero');await expect(hero).toBeVisible();
   await expect.poll(()=>hero.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(path==='/metiers/enfants')await page.screenshot({path:'test-results/children-hero-'+width+'.png'});
  }
 }
 await page.goto('/metiers?domaine=agriculture&lang=en');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Cultivate the land. Grow tomorrow.');
});
