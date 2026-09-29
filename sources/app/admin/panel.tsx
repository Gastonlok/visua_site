'use client';
import SafeForm from '@/components/safe-form';
import { useEffect,useState } from 'react';
import type { Experience } from '@/lib/models';
import { clientId } from '@/lib/client-id';
import { provinces } from '@/lib/catalogue-metadata';
const labels={draft:'Brouillon',review:'À vérifier',verified:'Vérifié',published:'Publié',archived:'Archivé'};
function blank():Experience{return {id:clientId(),slug:'',title:'',kind:'metier',sector:'',location:'',description:'',body:'',image:'',imageAlt:'',imageCredit:'',imageSource:'',duration:'',format:'text',mediaUrl:'',mediaCredit:'',mediaSource:'',capturedAt:'',transcript:'',points:[],skills:[],status:'draft',isDemo:true,rightsConfirmed:false,version:0,updatedAt:''}}
export default function ContentPanel({userRole,userId,initialStatus='',initialCreate=false,initialId,mediaOnly=false}:{userRole:string;userId:string;initialStatus?:string;initialCreate?:boolean;initialId?:string;mediaOnly?:boolean}){
 const [items,setItems]=useState<Experience[]>([]),[edit,setEdit]=useState<Experience|null>(()=>initialCreate?blank():null),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[loading,setLoading]=useState(true),[query,setQuery]=useState(''),[dirty,setDirty]=useState(false),[mine,setMine]=useState(false),[status,setStatus]=useState(initialStatus),[kind,setKind]=useState('');
 async function load(){try{const r=await fetch('/api/admin/contenus'),v=await r.json();if(!r.ok)throw Error(v.error);setItems(v.items)}catch(e){setError(e instanceof Error?e.message:'Chargement impossible.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 useEffect(()=>{if(initialId)setEdit(items.find(e=>e.id===initialId)||null)},[initialId,items]);
 function abandon(){return !dirty||confirm('Des modifications ne sont pas enregistrées. Les abandonner ?')}
 useEffect(()=>{if(!dirty)return;const before=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};const navigate=(e:MouseEvent)=>{const link=(e.target as Element).closest('a[href]');if(link&&link.getAttribute('target')!=='_blank'&&!confirm('Des modifications ne sont pas enregistrées. Quitter cette fiche ?')){e.preventDefault();e.stopPropagation()}};window.addEventListener('beforeunload',before);document.addEventListener('click',navigate,true);return()=>{window.removeEventListener('beforeunload',before);document.removeEventListener('click',navigate,true)}},[dirty]);
 function field<K extends keyof Experience>(key:K,value:Experience[K]){setDirty(true);setEdit(e=>e?{...e,[key]:value}:e)}
 async function uploadImage(file:File){
  const accepted=['image/jpeg','image/png','image/webp','image/avif'];
  if(!accepted.includes(file.type)){setError('Choisissez une image JPEG, PNG, WebP ou AVIF.');return}
  if(file.size>4_000_000){setError('L’image dépasse la limite de 4 Mo.');return}
  setUploading(true);setError('');setMessage('');
  try{
   const r=await fetch('/api/admin/images',{method:'POST',headers:{'Content-Type':file.type},body:file}),v=await r.json();
   if(!r.ok)throw Error(v.error);
   field('image',v.url);setMessage('Image importée. Enregistrez la fiche pour confirmer son remplacement.');
  }catch(e){setError(e instanceof Error?e.message:'Import de l’image impossible.')}finally{setUploading(false)}
 }
 async function save(event:React.FormEvent){event.preventDefault();if(!edit)return;setBusy(true);setError('');setMessage('');
  try{const r=await fetch('/api/admin/contenus',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(edit)}),v=await r.json();if(!r.ok)throw Error(v.error);setEdit(v.item);setDirty(false);setMessage('Fiche enregistrée.');await load()}catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.')}finally{setBusy(false)}
 }
 async function remove(){if(!edit||!confirm('Supprimer définitivement ce brouillon ?'))return;setBusy(true);
  try{const r=await fetch('/api/admin/contenus',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:edit.id,version:edit.version})}),v=await r.json();if(!r.ok)throw Error(v.error);setEdit(null);setDirty(false);setMessage('Brouillon supprimé.');await load()}catch(e){setError(e instanceof Error?e.message:'Suppression impossible.')}finally{setBusy(false)}
 }
 const selected=items.filter(e=>(!mine||e.authorId===userId)&&(!status||e.status===status)&&(!kind||e.kind===kind)&&(!mediaOnly||!!e.image||!!e.mediaUrl)&&e.title.toLowerCase().includes(query.toLowerCase()));
 return <section aria-label="Gestion des fiches">
 <div className="panel-heading"><div><h2>{mediaOnly?'Médias et panoramas':'Les fiches de l’équipe'}</h2><p>{items.length} fiches · {mediaOnly?'Sélectionnez une fiche pour gérer ses images, crédits et médias.':'Textes, médias et points d’intérêt'}</p></div><button className="btn dark" onClick={()=>{if(!abandon())return;setDirty(false);setEdit(blank());setError('');setMessage('')}}>Créer une fiche</button></div>
 {message&&<p role="status" className="admin-msg">{message}</p>}{error&&<p role="alert" className="error-message">{error} <button onClick={()=>void load()}>Réessayer</button></p>}
 {edit?<SafeForm className="editor" onSubmit={save}><div className="panel-heading"><h2>{edit.version?'Modifier la fiche':'Nouvelle fiche'}</h2><button type="button" className="under-link" onClick={()=>{if(abandon()){setDirty(false);setEdit(null)}}}>Fermer</button></div>
 <p role="status" className="save-state">{dirty?'Modifications non enregistrées':'Aucune modification en attente'}</p><div className="form-row"><label>Titre<input required minLength={3} maxLength={120} value={edit.title} onChange={e=>field('title',e.target.value)}/></label><label>Adresse de la fiche<input required disabled={edit.version>0} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={edit.slug} onChange={e=>field('slug',e.target.value)}/></label></div>
 <div className="form-row"><label>Type<select value={edit.kind} onChange={e=>field('kind',e.target.value as Experience['kind'])}><option value="metier">Métier</option><option value="destination">Territoire</option><option value="projet">Projet</option><option value="demo">Démonstration</option></select></label><label>État<select value={edit.status} onChange={e=>field('status',e.target.value as Experience['status'])}>{(userRole==='admin'?['draft','review','verified','published','archived']:['draft','review']).map(s=><option key={s} value={s}>{labels[s as keyof typeof labels]}</option>)}</select></label></div>
 <div className="form-row"><label>Secteur<input required minLength={2} maxLength={80} value={edit.sector} onChange={e=>field('sector',e.target.value)}/></label><label>Lieu<input maxLength={160} value={edit.location} onChange={e=>field('location',e.target.value)}/></label></div>
 {edit.kind==='metier'&&<label>Domaine<select value={edit.domain||'autre'} onChange={e=>field('domain',e.target.value as Experience['domain'])}>{['mines','agriculture','tourisme','environnement','btp','autre'].map(d=><option key={d}>{d}</option>)}</select></label>}
 {edit.kind==='destination'&&<fieldset className="province-editor"><legend>Provinces</legend><div>{provinces.map(p=><label key={p} className="check-label"><input type="checkbox" checked={edit.provinces?.includes(p)||false} onChange={e=>field('provinces',e.target.checked?[...(edit.provinces||[]),p]:(edit.provinces||[]).filter(x=>x!==p))}/>{p}</label>)}</div></fieldset>}
 <label>Résumé<textarea required minLength={10} maxLength={400} rows={3} value={edit.description} onChange={e=>field('description',e.target.value)}/></label>
 <label>Contenu<textarea required minLength={30} maxLength={12000} rows={8} value={edit.body} onChange={e=>field('body',e.target.value)}/></label>
 <div className="form-row"><label>Durée<input maxLength={80} value={edit.duration} onChange={e=>field('duration',e.target.value)}/></label><label>Repères (séparés par des virgules)<input value={edit.skills.join(', ')} onChange={e=>field('skills',e.target.value.split(',').map(x=>x.trim()).filter(Boolean))}/></label></div>
 <h3>Image de présentation</h3>
 <div className="image-editor">
  {edit.image?<div className="image-editor-preview">
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={edit.image} alt={edit.imageAlt||'Aperçu de l’image de la fiche'}/>
   <button type="button" className="btn outline" disabled={uploading} onClick={()=>field('image','')}>Retirer l’image</button>
  </div>:<div className="image-editor-placeholder">Aucune image sélectionnée</div>}
  <div><label>Importer une image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void uploadImage(file)}}/></label>
  <p className="small" role={uploading?'status':undefined}>{uploading?'Import et optimisation en cours…':'JPEG, PNG, WebP ou AVIF · 4 Mo maximum. L’image est optimisée automatiquement.'}</p>
  <p className="small">Utilisez le bouton ci-dessus pour ajouter ou remplacer l’image de la fiche.</p></div>
 </div>
 <label>Description de l’image<input value={edit.imageAlt||''} onChange={e=>field('imageAlt',e.target.value)}/></label>
 <div className="form-row"><label>Crédits et licence<input value={edit.imageCredit} onChange={e=>field('imageCredit',e.target.value)}/></label><label>Page source<input value={edit.imageSource} onChange={e=>field('imageSource',e.target.value)}/></label></div>
 <h3>Média et alternative accessible</h3>
 <label>Format<select value={edit.format} onChange={e=>field('format',e.target.value as Experience['format'])}><option value="text">Fiche à lire</option><option value="panorama">Panorama 360°</option><option value="video360">Vidéo 360°</option><option value="video">Vidéo classique</option></select></label>
 <p className="small">Pour le 360°, utilisez un média équirectangulaire 2:1 dont l’hébergeur autorise la lecture depuis le site. Aucun hébergement vidéo payant n’est ajouté.</p>
 <label>Adresse du média<input value={edit.mediaUrl} onChange={e=>field('mediaUrl',e.target.value)}/></label>
 <div className="form-row"><label>Crédits et licence du média<input value={edit.mediaCredit} onChange={e=>field('mediaCredit',e.target.value)}/></label><label>Page source du média<input value={edit.mediaSource} onChange={e=>field('mediaSource',e.target.value)}/></label></div>
 <label>Date de captation<input value={edit.capturedAt} onChange={e=>field('capturedAt',e.target.value)}/></label>
 <label>Alternative textuelle<textarea rows={4} maxLength={12000} value={edit.transcript} onChange={e=>field('transcript',e.target.value)}/></label>
 <h3>Points d’intérêt</h3>{edit.points.map((p,i)=><fieldset className="point-editor" key={i}><legend>Point {i+1}</legend><label>Titre<input required value={p.title} onChange={e=>field('points',edit.points.map((x,j)=>j===i?{...x,title:e.target.value}:x))}/></label><label>Description<textarea required value={p.text} onChange={e=>field('points',edit.points.map((x,j)=>j===i?{...x,text:e.target.value}:x))}/></label><div className="form-row"><label>Angle horizontal<input type="number" min={-180} max={180} step="any" value={p.yaw} onChange={e=>field('points',edit.points.map((x,j)=>j===i?{...x,yaw:Number(e.target.value)}:x))}/></label><label>Angle vertical<input type="number" min={-80} max={80} step="any" value={p.pitch} onChange={e=>field('points',edit.points.map((x,j)=>j===i?{...x,pitch:Number(e.target.value)}:x))}/></label></div><button type="button" onClick={()=>field('points',edit.points.filter((_,j)=>j!==i))}>Retirer ce point</button></fieldset>)}
 <button type="button" className="under-link" disabled={edit.points.length>=12} onClick={()=>field('points',[...edit.points,{title:'Nouveau repère',text:'Description à compléter.',yaw:0,pitch:0}])}>Ajouter un point</button>
 <h3>Sources documentaires</h3>{(edit.sources||[]).map((s,i)=><div className="point-editor" key={i}><label>Nom de la source<input required value={s.title} onChange={e=>field('sources',edit.sources?.map((x,j)=>j===i?{...x,title:e.target.value}:x))}/></label><label>Adresse de la source<input value={s.url} onChange={e=>field('sources',edit.sources?.map((x,j)=>j===i?{...x,url:e.target.value}:x))}/></label><button type="button" onClick={()=>field('sources',edit.sources?.filter((_,j)=>j!==i))}>Retirer la source</button></div>)}
 <button type="button" className="under-link" disabled={(edit.sources?.length||0)>=8} onClick={()=>field('sources',[...(edit.sources||[]),{title:'Nouvelle source',url:''}])}>Ajouter une source</button>
 <h3>Référencement</h3><label>Titre SEO (facultatif)<input maxLength={120} value={edit.seoTitle||''} onChange={e=>field('seoTitle',e.target.value)}/></label><label>Description SEO (facultative)<textarea maxLength={300} value={edit.seoDescription||''} onChange={e=>field('seoDescription',e.target.value)}/></label>
 <p className="small">Les modifications de texte nécessitent aussi la mise à jour de la traduction anglaise. Sans traduction, la version française est conservée.</p>
 <label className="check-label"><input type="checkbox" checked={edit.isDemo} onChange={e=>field('isDemo',e.target.checked)}/>Contenu pilote ou démonstration</label>
 <label className="check-label"><input type="checkbox" checked={edit.rightsConfirmed} onChange={e=>field('rightsConfirmed',e.target.checked)}/>Droits et informations vérifiés</label>
 <div className="admin-toolbar"><button className="btn dark" disabled={busy||uploading}>{busy?'Enregistrement…':'Enregistrer la fiche'}</button>{userRole==='admin'&&edit.version>0&&edit.status==='draft'&&<button type="button" className="btn danger" disabled={busy} onClick={()=>void remove()}>Supprimer le brouillon</button>}</div>
 </SafeForm>:<><label className="check-label"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/> Mes fiches uniquement</label><label className="dashboard-search">Rechercher une fiche<input value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="admin-filter-row"><label>État de publication<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Tous les états</option>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Type de fiche<select value={kind} onChange={e=>setKind(e.target.value)}><option value="">Tous les types</option><option value="metier">Métier</option><option value="destination">Territoire</option><option value="demo">Démonstration</option><option value="projet">Projet</option></select></label><p role="status">{selected.length} fiches affichées</p></div>{loading?<p role="status">Chargement…</p>:<div className="admin-list">{selected.map(e=><article className="admin-item" key={e.id}>{e.image&&<img className="admin-thumbnail" src={e.image} alt={e.imageAlt||''} loading="lazy" width="88" height="66"/>}<div><h3>{e.title}</h3><p>{labels[e.status]} · {e.kind} · v{e.version}</p></div><button className="btn outline" disabled={userRole!=='admin'&&['verified','published','archived'].includes(e.status)} onClick={()=>{setEdit(e);setError('');setMessage('')}}>Modifier</button>{e.status==='published'&&<a className="under-link" href={'/experiences/'+e.slug}>Voir la fiche</a>}</article>)}</div>}</>}
 </section>;
}
