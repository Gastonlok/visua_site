> Mise à jour après corrections : les constats ci-dessous décrivent l’état audité avant réparation. Le composant d’icônes a été renommé, les formulaires sensibles sont protégés sans JavaScript, les fiches avertissent avant abandon et le visuel d’accueil dispose de variantes WebP. Voir [CORRECTIONS_AUDIT.md](CORRECTIONS_AUDIT.md) pour les résultats et les éléments encore ouverts.
# Audit de la version actuelle — 13 septembre 2026

## Conclusion

Le site dispose d’un parcours public fonctionnel, d’un catalogue structuré et d’une administration avec contrôles serveur. La version actuelle ne doit pas être déployée telle quelle : le build de production échoue depuis l’ajout des icônes, et le formulaire de connexion peut transmettre le mot de passe dans l’URL lorsque JavaScript ne fonctionne pas.

Cet audit porte sur le code local `sources/` et le serveur `http://localhost:3000`, connecté à Neon. Il ne constitue pas un audit du domaine visuaa.io en production. Aucune fiche, aucun compte ni paramètre métier n’a été modifié. Une connexion avec des identifiants fictifs a été testée sans JavaScript ; aucun vrai mot de passe n’a été utilisé pour ce test.

## Constats prioritaires

### P1 — Le build de production échoue à cause du composant d’icônes

**Confirmé par exécution du build.** `app/dashboard/icon.tsx` est un nom réservé par Next.js : il devient une route de métadonnées `/dashboard/icon`. Le composant renvoie un élément React SVG alors que cette route attend une réponse HTTP. Le build termine avec le code 1 et le message « No response is returned from route handler ».

Il s’agit d’une régression introduite lors de l’ajout des icônes. La réussite de TypeScript ne la détecte pas.

**Correction :** renommer le composant en `dashboard-icon.tsx` ou le déplacer hors de cette convention, actualiser ses imports dans `workspace.tsx` et `admin-overview.tsx`, puis relancer le build. Référence : [conventions de métadonnées Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata).

### P1 — Le mot de passe peut apparaître dans l’URL

**Reproduit dans Edge avec JavaScript désactivé.** Le formulaire dans `app/connexion/auth-form.tsx:12` ne précise ni méthode ni destination native. Sans son gestionnaire React, le navigateur utilise GET vers la page courante et ajoute les champs `email` et `password` aux paramètres de l’URL.

**Impact :** exposition possible dans l’historique et les journaux de requêtes. Cela n’établit pas qu’un vrai mot de passe a été compromis. La connexion normale avec JavaScript utilise bien POST.

**Correction :** prévoir explicitement une soumission POST et un traitement serveur adapté, ou rendre la soumission impossible avant l’initialisation JavaScript avec un message accessible. Ne pas se contenter du masquage visuel du champ. Vérifier aussi l’inscription, le contact (`app/contact-form.tsx:16`) et les formulaires de comptes qui reposent sur le même principe. Le risque de GET sur ces autres formulaires est relevé par lecture du code ; seul le formulaire de connexion a été reproduit sans JavaScript.

### P2 — Modifications de fiches perdues sans avertissement

**Constaté dans le code**, non reproduit dans une session admin durant cet audit. Dans `app/admin/panel.tsx:24`, « Fermer » exécute directement `setEdit(null)`. Les liens du tableau de bord changent de document. Aucun état « modifications non enregistrées », avertissement de sortie ou sauvegarde automatique n’est présent.

**Impact :** un texte, une liste de points ou des crédits en cours de saisie peuvent être perdus après un clic de navigation.

**Correction :** suivre les modifications depuis la dernière sauvegarde, confirmer la fermeture ou la navigation lorsqu’elles existent, afficher l’état de sauvegarde et protéger également le rechargement de page.

### P2 — Le tableau de bord ne permet pas encore de piloter tout le site

**Constaté dans le code.** L’administration gère les fiches, médias liés, demandes, comptes, paramètres SEO et redirections. En revanche :

- Les textes et images de l’accueil et de la page À propos sont codés dans les composants.
- Le réglage de marque ne remplace pas tous les textes VISUA/VISUAA ni le logo.
- Le panneau médias édite des URL ; il ne téléverse pas de fichiers.
- Les fiches disposent d’un compteur de version pour éviter les écrasements concurrents, mais pas d’un historique de contenu permettant de restaurer une ancienne version.

**Conséquence :** la demande de « contrôle complet » n’est que partiellement satisfaite. Ajouter un éditeur des pages et de leurs sections, une médiathèque avec stockage choisi, puis un historique restaurable. Les contrôles de rôle existants doivent s’appliquer à ces futures fonctions.

Repères : `app/dashboard/workspace.tsx` (SettingsPanel), `app/admin/panel.tsx`, `app/ui.tsx`, `app/qui-sommes-nous/page.tsx`, `components/discovery-gallery.tsx`.

### P2 — Documents de lancement incomplets et partiellement périmés

**Constaté sur les pages rendues et dans le code.** Les mentions comportent bien VISUA SARL, mais l’adresse officielle et le directeur de publication restent à confirmer. La notice de confidentialité indique encore que le fournisseur PostgreSQL est à choisir alors que Neon est configuré. La durée de conservation définitive reste non définie.

**Action :** compléter les informations factuelles, harmoniser les prestataires avec la configuration retenue et faire valider ces documents avant collecte publique. Ce constat est éditorial et opérationnel ; aucune conformité juridique n’est certifiée ici.

Repères : `app/mentions-legales/page.tsx:2`, `app/confidentialite/page.tsx:2`, `docs/NEON.md`.

### P2 — Chargement du catalogue à optimiser avant montée en volume

**Constaté dans le code et les fichiers.** `db/repository.ts:33` charge toutes les fiches, puis leurs médias et points ; le filtrage et la pagination interviennent ensuite en mémoire. L’administration charge également toute la liste. La grande illustration d’accueil `public/images/congovr-hero.png` pèse environ 2,44 Mo.

**Impact :** travail serveur et transfert initial des médias évitables, surtout sur connexion mobile lente. Aucun score Lighthouse ni seuil de latence n’a été mesuré dans cet audit.

**Action :** produire des variantes responsives compressées du visuel, puis déplacer filtres/pagination en SQL et mesurer sur un déploiement représentatif. Les images WebP existantes et le chargement différé de nombreux visuels constituent déjà de bons points.

## Résultats réellement obtenus pendant cet audit

| Vérification | Résultat |
|---|---|
| TypeScript strict | Réussi |
| Tests d’intégration, base isolée | 30/30 réussis |
| Tests des langues | 6/6 réussis |
| Build de production | Échec sur `/dashboard/icon` |
| Pages publiques : accueil, métiers, destinations, catalogue, À propos, contact, connexion, mentions, confidentialité | 9 réponses HTTP 200, titre principal et canonical présents |
| Débordement horizontal à 390 px, sur ces 9 pages | Aucun détecté |
| Accès anonyme à l’API utilisateurs | HTTP 401 |
| Connexion sans JavaScript, données fictives | Mot de passe présent dans les paramètres de l’URL |
| Connexion admin avec les identifiants initiaux du fichier local | Refus : « Adresse ou mot de passe incorrect. » |

Le refus des identifiants initiaux ne démontre pas une panne de connexion : le mot de passe peut avoir été changé. Aucun mot de passe n’a été réinitialisé. Les tests actuels du tableau de bord en session réelle n’ont donc pas pu être menés à terme ; les recettes antérieures ne sont pas présentées comme une nouvelle validation.

Les tests isolés vérifient notamment les rôles, l’isolation des demandes, les sessions, le contrôle Origin, la validation, les requêtes paramétrées, les conflits de versions et le dernier administrateur. Ils ne prouvent pas l’absence de toute vulnérabilité.

## Limites et ordre de traitement

1. Corriger le nom du composant d’icônes et le comportement natif des formulaires sensibles.
2. Protéger les modifications non enregistrées et terminer la recette admin avec un accès actuel.
3. Compléter la gestion des pages et médias selon le périmètre souhaité.
4. Finaliser les informations de lancement, les médias et la recette du déploiement.

La configuration actuelle reste locale et de préproduction. Les canonicals localhost sont cohérents ici, mais SITE_URL doit être adaptée au déploiement. SITE_PUBLIC=false/noindex ne remplace pas une protection d’accès à un hébergement de préproduction.

Non réalisés : audit de dépendances contre une base CVE, test de charge, mesure Lighthouse, audit d’accessibilité complet, test de casque physique, audit juridique, vérification des DNS et de Vercel en production, restauration de sauvegarde Neon. Les requêtes de connexion peuvent alimenter les compteurs de limitation ; aucune donnée métier n’a été enregistrée par la recette.

Le code applicatif est inchangé par cet audit. Les résultats navigateur détaillés sont conservés localement dans `outputs/audit-current-results.json`.
