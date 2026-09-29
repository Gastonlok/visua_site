'use client';
import {useEffect,useMemo,useState} from 'react';
import {categoryLabel,contentCategories} from '@/lib/content-categories';
import {DOCUMENT_MAX_BYTES,formatBytes,mediaType,type MediaAsset,VIDEO_MAX_BYTES} from '@/lib/media-assets';
import type {ContentAttachment} from '@/lib/models';

type Props={
 category?:string;
 selectedVideoUrl?:string;
 attachedIds?:string[];
 onSelectVideo?:(asset:MediaAsset)=>void;
 onAttachDocument?:(attachment:ContentAttachment)=>void;
};

const groups=Array.from(new Set(contentCategories.map(category=>category.group)));
function mime(file:File){
 if(mediaType(file.type))return file.type;
 const extension=file.name.split('.').pop()?.toLowerCase();
 return extension==='mp4'?'video/mp4':extension==='webm'?'video/webm':extension==='pdf'?'application/pdf':file.type;
}

export default function MediaLibrary({category,selectedVideoUrl='',attachedIds=[],onSelectVideo,onAttachDocument}:Props){
 const [items,setItems]=useState<MediaAsset[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [query,setQuery]=useState(''),[kind,setKind]=useState(''),[categoryFilter,setCategoryFilter]=useState(''),[uploadCategory,setUploadCategory]=useState(category&&contentCategories.some(item=>item.id===category)?category:contentCategories[0].id),[progress,setProgress]=useState<number|null>(null);
 async function load(){try{const response=await fetch('/api/admin/media-assets'),value=await response.json();if(!response.ok)throw Error(value.error);setItems(value.items);setError('')}catch(reason){setError(reason instanceof Error?reason.message:'Chargement de la médiathèque impossible.')}finally{setLoading(false)}}
 useEffect(()=>{let active=true;fetch('/api/admin/media-assets').then(async response=>{const value=await response.json();if(!response.ok)throw Error(value.error);return value.items as MediaAsset[]}).then(value=>{if(active){setItems(value);setError('')}}).catch(reason=>{if(active)setError(reason instanceof Error?reason.message:'Chargement de la médiathèque impossible.')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
 const filtered=useMemo(()=>items.filter(item=>(!kind||item.kind===kind)&&(!categoryFilter||item.category===categoryFilter)&&item.name.toLowerCase().includes(query.trim().toLowerCase())),[items,kind,categoryFilter,query]);
 async function upload(file:File){
  const mimeType=mime(file),accepted=mediaType(mimeType);setError('');setMessage('');
  if(!accepted){setError('Choisissez une vidéo MP4 ou WebM, ou un document PDF.');return}
  if(file.size>accepted.maximum){setError(accepted.kind==='video'?`La vidéo dépasse la limite de ${formatBytes(VIDEO_MAX_BYTES)}.`:`Le document dépasse la limite de ${formatBytes(DOCUMENT_MAX_BYTES)}.`);return}
  setProgress(0);
  try{
   let response=await fetch('/api/admin/media-assets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:file.name,mimeType,size:file.size,category:uploadCategory})}),value=await response.json();
   if(!response.ok)throw Error(value.error);
   for(let position=0;position<value.chunkCount;position++){
    const start=position*value.chunkSize,chunk=file.slice(start,Math.min(start+value.chunkSize,file.size));
    response=await fetch('/api/admin/media-assets/'+value.id,{method:'PUT',headers:{'Content-Type':'application/octet-stream','X-Chunk-Index':String(position)},body:chunk});
    if(!response.ok){value=await response.json();throw Error(value.error)}
    setProgress(Math.round(((position+1)/value.chunkCount)*95));
   }
   response=await fetch('/api/admin/media-assets/'+value.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:'{}'});value=await response.json();if(!response.ok)throw Error(value.error);
   setProgress(100);setMessage('Fichier importé et classé dans la médiathèque.');await load();
  }catch(reason){setError(reason instanceof Error?reason.message:'Import impossible.')}finally{setProgress(null)}
 }
 async function remove(asset:MediaAsset){
  if(!confirm('Supprimer définitivement « '+asset.name+' » de la médiathèque ?'))return;setError('');setMessage('');
  try{const response=await fetch('/api/admin/media-assets/'+asset.id,{method:'DELETE',headers:{'Content-Type':'application/json'},body:'{}'}),value=await response.json();if(!response.ok)throw Error(value.error);setMessage('Fichier supprimé.');await load()}catch(reason){setError(reason instanceof Error?reason.message:'Suppression impossible.')}
 }
 return <section className="media-library" aria-label="Médiathèque">
  <div className="panel-heading"><div><h3>Médiathèque</h3><p>Vidéos MP4 ou WebM jusqu’à 100 Mo · documents PDF jusqu’à 15 Mo.</p></div><span className="pill">{items.length} fichiers</span></div>
  {message&&<p role="status" className="admin-msg">{message}</p>}{error&&<p role="alert" className="error-message">{error}</p>}
  <div className="media-upload-box"><label>Catégorie du fichier<select value={uploadCategory} onChange={event=>setUploadCategory(event.target.value)}>{groups.map(group=><optgroup label={group} key={group}>{contentCategories.filter(category=>category.group===group).map(category=><option value={category.id} key={category.id}>{category.label}</option>)}</optgroup>)}</select></label>
  <label className="media-file-input">Importer une vidéo ou un PDF<input type="file" accept="video/mp4,video/webm,application/pdf,.mp4,.webm,.pdf" disabled={progress!==null} onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';if(file)void upload(file)}}/></label>
  {progress!==null&&<div className="upload-progress" role="status"><progress max="100" value={progress}/><span>Import : {progress} %</span></div>}</div>
  <div className="media-filters"><label>Rechercher<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Nom du fichier"/></label><label>Type de fichier<select value={kind} onChange={event=>setKind(event.target.value)}><option value="">Tous</option><option value="video">Vidéos</option><option value="document">Documents</option></select></label><label>Catégorie des fichiers<select value={categoryFilter} onChange={event=>setCategoryFilter(event.target.value)}><option value="">Toutes</option>{groups.map(group=><optgroup label={group} key={group}>{contentCategories.filter(category=>category.group===group).map(category=><option value={category.id} key={category.id}>{category.label}</option>)}</optgroup>)}</select></label></div>
  {loading?<p role="status">Chargement de la médiathèque…</p>:filtered.length===0?<div className="notice">Aucun fichier ne correspond aux filtres.</div>:<div className="media-asset-grid">{filtered.map(asset=>{
   const selected=selectedVideoUrl===asset.url||attachedIds.includes(asset.id);return <article className={'media-asset '+(selected?'selected':'')} key={asset.id}>
    {asset.kind==='video'?<video controls preload="metadata" src={asset.previewUrl}/>:<a className="document-preview" href={asset.previewUrl} target="_blank" rel="noreferrer">PDF</a>}
    <div><span className="pill">{asset.kind==='video'?'Vidéo':'PDF'}</span><h4>{asset.name}</h4><p>{categoryLabel(asset.category)} · {formatBytes(asset.byteSize)}</p></div>
    <div className="admin-toolbar">{asset.kind==='video'&&onSelectVideo&&<button type="button" className="btn outline" disabled={selectedVideoUrl===asset.url} onClick={()=>onSelectVideo(asset)}>{selectedVideoUrl===asset.url?'Vidéo sélectionnée':'Utiliser cette vidéo'}</button>}{asset.kind==='document'&&onAttachDocument&&<button type="button" className="btn outline" disabled={attachedIds.includes(asset.id)} onClick={()=>onAttachDocument({assetId:asset.id,title:asset.name,url:asset.url,mimeType:asset.mimeType,size:asset.byteSize})}>{attachedIds.includes(asset.id)?'Document joint':'Joindre à la fiche'}</button>}<button type="button" className="btn danger" onClick={()=>void remove(asset)}>Supprimer</button></div>
   </article>})}</div>}
 </section>
}
