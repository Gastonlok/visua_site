'use client';
import {useSyncExternalStore,type ComponentProps} from 'react';
const subscribe=()=>()=>{};
export default function SafeForm({children,...props}:Omit<ComponentProps<'form'>,'method'|'action'>){
 const ready=useSyncExternalStore(subscribe,()=>true,()=>false);
 return <form {...props} method="post" action="/api/form-unavailable"><fieldset className="safe-form-fields" disabled={!ready}>{children}</fieldset>{!ready&&<p role="status">JavaScript est nécessaire pour envoyer ce formulaire. Si ce message persiste, activez-le puis rechargez la page. Aucune donnée n’a été envoyée.</p>}</form>;
}
