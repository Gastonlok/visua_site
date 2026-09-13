'use client';
import {translateNode} from '@/lib/i18n/tree';
import {useLocale} from '@/components/language-provider';
export default function ErrorPage({reset}:{reset:()=>void}){const locale=useLocale();return translateNode(<main id="main" className="page-main empty"><h1>Une interruption inattendue.</h1><p>Vos informations déjà enregistrées sont conservées. Réessayez dans un instant.</p><button className="btn dark" onClick={reset}>Réessayer</button></main>,locale)}