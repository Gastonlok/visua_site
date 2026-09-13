export const context={cookie:'',locale:'fr',path:'/'};
export async function headers(){return new Headers({'cookie':context.cookie,'x-visua-locale':context.locale,'x-visua-path':context.path})}
export async function cookies(){return {get(name){const value=context.cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1);return value?{name,value}:undefined}}}
