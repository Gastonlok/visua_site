'use client';
import SafeForm from '@/components/safe-form';
import { useState } from 'react';
import { clientId } from '@/lib/client-id';
import { useLocale } from '@/components/language-provider';
import { translateNode } from '@/lib/i18n/tree';
import Link from '@/components/site-link';
export default function ContactForm({initialIntent='demonstration',ficheId=''}:{initialIntent?:string;ficheId?:string}){
 const locale=useLocale(),[intent,setIntent]=useState(initialIntent),[busy,setBusy]=useState(false),[reference,setReference]=useState(''),[error,setError]=useState(''),[id,setId]=useState('');
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget,data=new FormData(form),requestId=id||clientId();setId(requestId);setBusy(true);setError('');
  try{const r=await fetch('/api/demandes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...Object.fromEntries(data),intent,ficheId:ficheId||null,id:requestId,consent:data.get('consent')==='on'})});const value=await r.json();if(!r.ok){if(r.status===409)setId('');throw Error(value.error)}setReference(value.reference)}
  catch(error){setError(error instanceof Error?error.message:'Envoi impossible.')}finally{setBusy(false)}
 }
 return translateNode(<main id="main" className="page-main contact-layout"><div className="contact-intro"><span className="eyebrow">UNE IDÉE PREND FORME</span><h1>Et si on<br/>en parlait ?</h1><p>Une séance pour votre établissement, un métier à faire découvrir, un lieu à valoriser : racontez-nous votre projet.</p><div className="notice"><p>Pour retrouver cette demande dans votre espace, <Link href="/connexion">connectez-vous</Link> avant de l’envoyer.</p></div><p>Kinshasa · République démocratique du Congo</p><a href="mailto:alaingb321@visuaa.io">alaingb321@visuaa.io</a></div>
 {reference?<section className="form-card" role="status"><h2>Votre demande est enregistrée.</h2><p>Référence : <strong>{reference}</strong></p><p>L’équipe peut maintenant consulter votre demande. Aucun e-mail automatique n’est envoyé.</p><Link className="btn dark" href="/catalogue">Continuer la découverte</Link></section>:
 <SafeForm className="form-card" onSubmit={submit}><h2>Votre projet commence ici.</h2>
 <label>Vous souhaitez<select value={intent} onChange={e=>setIntent(e.target.value)}><option value="demonstration">Organiser une démonstration</option><option value="devis">Obtenir un devis</option><option value="partenariat">Proposer un partenariat</option><option value="assistance">Demander de l’aide</option><option value="signalement">Signaler un contenu</option></select></label>
 <label>Nom<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>
 <label>Organisation (facultatif)<input name="organization" maxLength={160} autoComplete="organization"/></label>
 <label>Adresse e-mail<input name="email" type="email" required maxLength={200} autoComplete="email"/></label>
 <label>Parlez-nous de votre besoin<textarea name="message" required minLength={10} maxLength={3000} rows={5}/></label>
 <input name="website" className="honeypot" aria-hidden="true" tabIndex={-1} autoComplete="off"/>
 <label className="check-label"><input name="consent" type="checkbox" required style={{width:20}}/><span>J’accepte l’utilisation de mes informations pour traiter cette demande. <Link href="/confidentialite">Confidentialité</Link></span></label>
 {error&&<p role="alert" className="error-message">{error}</p>}<button className="btn dark full" disabled={busy}>{busy?'Enregistrement…':'Envoyer ma demande'}</button>
 </SafeForm>}</main>,locale);
}
