# Corrections après audit — 13 septembre 2026

## Défauts corrigés

- `icon.tsx` renommé en `dashboard-icon.tsx` : le composant SVG ne crée plus une route de métadonnées Next.js.
- Connexion, inscription, contact et formulaires administratifs utilisent un composant SafeForm : POST explicite, champs désactivés avant hydratation, message de secours visible. Une soumission native forcée atteint une route qui refuse la demande sans lire ni refléter les données. Le formulaire ne bascule plus implicitement en GET.
- L’éditeur de fiches affiche les modifications en attente et demande confirmation avant fermeture, création d’une autre fiche, navigation ou rechargement. Une sauvegarde réussie réinitialise cet état.
- Les notices identifient Neon et la région AWS Europe Francfort. Les informations inconnues ne sont pas inventées.
- Le visuel d’accueil dispose de trois variantes WebP sélectionnées par srcset : 57 620, 157 924 et 274 726 octets, contre 2 439 342 octets pour le PNG original conservé. Cela réduit le poids de ce média ; aucun gain Lighthouse global n’est revendiqué.
- Les tests navigateur utilisent `.next-e2e` pour ne pas bloquer le serveur de développement habituel.

## Vérification

- Build Next.js de production : réussi après renommage.
- Intégration : 30 tests réussis.
- Quatre parcours navigateur réussis : public/360/contact, client, administration et mobile/SEO. Le parcours administrateur vérifie aussi le refus d’abandon des modifications.
- Test sans JavaScript : réussi sur connexion, inscription et contact, ainsi que sur le refus d’une soumission native forcée. Un premier échec révélait un message noscript non rendu ; le message a été corrigé et le test relancé avec succès.

Les comptes navigateur sont créés dans une base de test isolée. Aucun mot de passe du compte administrateur Neon n’a été remplacé.

## Éléments encore ouverts

L’audit distinguait des défauts et des extensions fonctionnelles. L’édition complète des pages publiques, le téléversement dans un stockage de médias, l’historique restaurable et la pagination SQL restent des évolutions à réaliser ; ils ne sont pas présentés comme livrés par ces corrections. Les filtres et les compteurs existants restent fonctionnels avec le catalogue actuel.

Avant ouverture publique, il reste également à confirmer l’adresse officielle, le responsable de publication et la politique de conservation, puis à configurer et valider le déploiement. Le site n’a pas été déployé et aucun domaine n’a été modifié.
