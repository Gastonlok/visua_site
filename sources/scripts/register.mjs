import { registerHooks } from 'node:module';
import { readFileSync,existsSync } from 'node:fs';
import { fileURLToPath,pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const root=path.resolve(import.meta.dirname,'..');
registerHooks({
 resolve(spec,context,next){
  if(spec==='next/navigation'||spec==='next/headers'||spec==='next/server')return next(spec+'.js',context);
  if(spec.startsWith('@/'))spec=pathToFileURL(path.join(root,spec.slice(2))).href;
  if(spec.startsWith('.')||spec.startsWith('file:')){
   const url=new URL(spec,context.parentURL),file=fileURLToPath(url);
   for(const extension of ['.ts','.tsx'])if(existsSync(file+extension))return {url:pathToFileURL(file+extension).href,shortCircuit:true};
  }
  return next(spec,context);
 },
 load(url,context,next){
  if(/\.tsx?$/.test(url)&&!url.includes('/node_modules/'))return {format:'module',source:ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{fileName:fileURLToPath(url),compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,shortCircuit:true};
  return next(url,context);
 }
});
