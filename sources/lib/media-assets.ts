export const MEDIA_CHUNK_BYTES=2_000_000;
export const VIDEO_MAX_BYTES=100_000_000;
export const DOCUMENT_MAX_BYTES=15_000_000;

export type MediaAssetKind='video'|'document';
export type MediaAsset={
 id:string;
 name:string;
 kind:MediaAssetKind;
 mimeType:string;
 byteSize:number;
 category:string;
 url:string;
 previewUrl:string;
 createdAt:string;
 createdBy:string|null;
};

export const acceptedMediaTypes:Record<string,{kind:MediaAssetKind;maximum:number}>={
 'video/mp4':{kind:'video',maximum:VIDEO_MAX_BYTES},
 'video/webm':{kind:'video',maximum:VIDEO_MAX_BYTES},
 'application/pdf':{kind:'document',maximum:DOCUMENT_MAX_BYTES},
};

export function mediaType(type:string){return acceptedMediaTypes[type.toLowerCase()]}
export function mediaAssetUrl(id:string){return '/media-files/'+id}
export function formatBytes(size:number){
 if(size>=1_000_000)return (size/1_000_000).toLocaleString('fr-FR',{maximumFractionDigits:1})+' Mo';
 return Math.max(1,Math.ceil(size/1000)).toLocaleString('fr-FR')+' Ko';
}
