import {test,expect} from '@playwright/test';

test('header opens sections, closes accessibly and links to BTP and news',async({page})=>{
 await page.goto('/');
 const nav=page.getByRole('navigation',{name:'Navigation principale'});
 await expect(nav.getByRole('button')).toHaveText(['Accueil','Les métiers','Les territoires','Actualité','Qui sommes-nous']);
 const careers=nav.getByRole('button',{name:'Les métiers',exact:true});
 const panel=page.locator('#navigation-panel');
 await careers.click();await expect(panel).toBeVisible();await expect(careers).toHaveAttribute('aria-expanded','true');
 await panel.getByRole('link',{name:'BTP',exact:true}).focus();await page.keyboard.press('Escape');
 await expect(panel).toBeHidden();await expect(careers).toBeFocused();
 await careers.click();await page.screenshot({path:'test-results/header-desktop.png'});
 await panel.getByRole('link',{name:'BTP',exact:true}).click();await expect(page).toHaveURL(/domaine=btp/);
 await expect(page.getByRole('combobox',{name:'Domaine',exact:true})).toHaveValue('btp');
 await nav.getByRole('button',{name:'Actualité',exact:true}).click();await panel.getByRole('link',{name:'Toute l’actualité',exact:true}).click();
 await expect(page.getByRole('heading',{level:1,name:'Actualité'})).toBeVisible();
 await nav.getByRole('button',{name:'Les territoires',exact:true}).click();await page.locator('main').dispatchEvent('pointerdown');await expect(panel).toBeHidden();
});

test('mobile navigation fits and lets visitors open a subsection',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.getByRole('button',{name:'Ouvrir le menu',exact:true}).click();
 await page.getByRole('button',{name:'Les métiers',exact:true}).click();
 await expect(page.locator('#navigation-panel').getByRole('link',{name:'BTP',exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/header-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Fermer le sous-menu'}).click();await expect(page.locator('#navigation-panel')).toBeHidden();
 await page.getByRole('button',{name:'Fermer le menu',exact:true}).click();await expect(page.locator('#primary-navigation')).toBeHidden();
});
