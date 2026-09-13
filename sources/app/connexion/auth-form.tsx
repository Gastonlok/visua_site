'use client';
import SafeForm from '@/components/safe-form';
import { useState } from 'react';
import Link from '@/components/site-link';
export default function AuthForm({register=false}:{register?:boolean}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setError('');setBusy(true);const data=Object.fromEntries(new FormData(event.currentTarget));
  try{const r=await fetch('/api/auth/'+(register?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Error(result.error);window.location.assign('/dashboard')}
  catch(error){setError(error instanceof Error?error.message:'Connexion impossible.');setBusy(false)}
 }
 return <main id="main" className="page-main auth-page"><div><span className="eyebrow">VOTRE ESPACE VISUAA</span><h1>{register?'Créer mon compte':'Heureux de vous retrouver.'}</h1><p>{register?'Retrouvez les demandes envoyées depuis votre compte.':'Connectez-vous pour accéder à vos demandes et aux actions de votre rôle.'}</p></div>
 <SafeForm className="form-card" onSubmit={submit}>
 {register&&<label>Nom<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>}
 <label>Adresse e-mail<input name="email" type="email" required maxLength={200} autoComplete="email"/></label>
 <label>Mot de passe<input aria-label="Mot de passe" aria-describedby="password-help" name="password" type="password" required minLength={12} maxLength={128} autoComplete={register?'new-password':'current-password'}/><small id="password-help">12 caractères minimum.</small></label>
 {register&&<p className="small">Votre adresse n’est pas vérifiée par e-mail dans cette version. Aucune demande anonyme antérieure ne sera rattachée automatiquement à votre compte.</p>}
 {error&&<p className="error-message" role="alert">{error}</p>}
 <button className="btn dark full" disabled={busy}>{busy?'Veuillez patienter…':register?'Créer mon compte':'Se connecter'}</button>
 <p className="auth-link"><Link href={register?'/connexion':'/inscription'}>{register?'J’ai déjà un compte':'Créer un compte'}</Link></p>
 {!register&&<p className="small">Mot de passe oublié ? Contactez l’équipe VISUAA pour une vérification manuelle de votre identité. Aucun lien automatique n’est envoyé.</p>}
 </SafeForm></main>;
}
