import '../scripts/register.mjs';
import { registerHooks } from 'node:module';
registerHooks({resolve(spec,context,next){
 if(spec==='next/navigation')return {url:new URL('./navigation.mjs',import.meta.url).href,shortCircuit:true};
 if(spec==='next/headers')return {url:new URL('./headers.mjs',import.meta.url).href,shortCircuit:true};
 if(spec==='next/image')return {url:new URL('./image.mjs',import.meta.url).href,shortCircuit:true};
 if(spec==='sharp')return {url:new URL('./sharp.mjs',import.meta.url).href,shortCircuit:true};
 return next(spec,context);
}});
