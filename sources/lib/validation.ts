import { z } from 'zod';
export const safeUrl=z.string().max(2000).refine(v=>!v||(/^\/(?!\/)/.test(v)&&!/[\\\u0000-\u0020]/.test(v))||(()=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password}catch{return false}})(),'URL HTTPS ou chemin local requis');
export const experienceInput=z.object({
 id:z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
 title:z.string().trim().min(3).max(120),category:z.string().max(80).optional(),domain:z.enum(['mines','agriculture','tourisme','environnement','btp','autre']).optional(),
 provinces:z.array(z.string().min(2).max(80)).max(26).optional(),provinceNote:z.string().max(1500).optional(),
 provinceSources:z.array(z.object({title:z.string().min(1).max(200),url:safeUrl,page:z.string().max(100).optional()})).max(8).optional(),
 imageAlt:z.string().max(400).optional(),sources:z.array(z.object({title:z.string().min(1).max(200),url:safeUrl,page:z.string().max(100).optional()})).max(8).optional(),
 kind:z.enum(['metier','destination','demo','projet']),sector:z.string().trim().min(2).max(80),location:z.string().max(160),
 description:z.string().trim().min(10).max(400),body:z.string().trim().min(30).max(12000),image:safeUrl,imageCredit:z.string().max(500),imageSource:safeUrl,
 duration:z.string().max(80),format:z.enum(['text','panorama','video360','video']),mediaUrl:safeUrl,mediaCredit:z.string().max(500),mediaSource:safeUrl,
 capturedAt:z.string().max(100),transcript:z.string().max(12000),
 points:z.array(z.object({title:z.string().min(1).max(80),text:z.string().min(1).max(600),yaw:z.number().min(-180).max(180),pitch:z.number().min(-80).max(80)})).max(12),
 skills:z.array(z.string().max(80)).max(10),status:z.enum(['draft','review','verified','published','archived']),isDemo:z.boolean(),rightsConfirmed:z.boolean(),
 version:z.number().int().min(0),updatedAt:z.string().max(100),authorId:z.string().nullable().optional(),
 seoTitle:z.string().max(120).optional(),seoDescription:z.string().max(300).optional(),
});
export const leadInput=z.object({
 id:z.string().uuid(),ficheId:z.string().max(80).nullable().optional(),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(200).transform(v=>v.toLowerCase()),
 organization:z.string().trim().max(160).default(''),intent:z.enum(['demonstration','devis','partenariat','assistance','signalement']),
 message:z.string().trim().min(10).max(3000),consent:z.literal(true),website:z.string().max(200).optional(),
});
export const credentials=z.object({email:z.string().trim().email().max(200).transform(v=>v.toLowerCase()),password:z.string().min(12).max(128)});
export const registration=credentials.extend({name:z.string().trim().min(2).max(100)});
export function publicationIssue(e:z.infer<typeof experienceInput>) {
 if(!['verified','published'].includes(e.status))return '';
 if((e.image&&(!e.imageCredit||!e.imageSource))||(!e.image&&e.format!=='text'))return 'Une image et ses crédits sont requis avant publication.';
 if(!e.isDemo&&!e.rightsConfirmed)return 'Confirmez les droits et la validation éditoriale.';
 if(e.format!=='text'&&(!e.mediaUrl||!e.mediaCredit||!e.mediaSource||!e.transcript))return 'Le média, ses crédits et une alternative textuelle sont requis.';
 return '';
}
