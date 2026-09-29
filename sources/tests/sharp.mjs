export default function sharp(input){
 const bytes=Uint8Array.from(input);
 const png=bytes.length>=8&&bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47;
 const api={
  metadata:async()=>({format:png?'png':undefined}),
  rotate:()=>api,
  resize:()=>api,
  webp:()=>api,
  toBuffer:async()=>Buffer.from(bytes),
 };
 return api;
}
