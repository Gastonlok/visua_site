# Validation

## Environnements

Node 22.17.0 sur Windows pour cette session ; Node 24 recommandé pour le déploiement. PostgreSQL PGlite isolé en mémoire pour l'intégration, et base PGlite indépendante sur disque pour chaque recette navigateur. Aucun test n'accède à la base ou au domaine de production.

## Commandes

```sh
node node_modules/typescript/bin/tsc --noEmit
node --import ./tests/loader.mjs tests/integration.mjs
corepack pnpm run test:i18n
corepack pnpm run lint
corepack pnpm run build
corepack pnpm run test:e2e
```

Les scripts TypeScript sont transpilés avec leur véritable extension. Les tests simulent le contexte de cookies/headers et les primitives de navigation Next pour le rendu isolé, pas les rôles ni les décisions d'autorisation. Les comptes, mots de passe, sessions, migrations, requêtes SQL et routes sont réels. La recette Playwright utilise un serveur Next et le navigateur réels.

## Couverture

- Migration répétable, seed sans écrasement, relations de médias et points.
- En-têtes d'identité forgés, sessions, hash, inscription viewer et adresses réservées.
- Matrice admin/editor/viewer, dernier administrateur, désactivation et révocation.
- Origin, type et taille du corps, validation, honeypot et limitation persistante.
- Demandes rattachées à la session, confidentialité entre utilisateurs, idempotence.
- Workflow, médias et crédits, versions concurrentes, rollback si audit en panne.
- Suppression, pagination des demandes, comptes et audit.
- SEO public, sitemap, robots, JSON-LD sûr, redirections, filtrage et SSR.
- Traductions du catalogue initial.
- Parcours navigateur public, compte client, administration, mobile simulé et langue.

## Limites

PGlite exécute PostgreSQL mais ne remplace pas une recette du réseau et du pool du fournisseur managé. Les tests n'ont pas validé un casque physique, un téléphone réel, un écran braille ou une conformité d'accessibilité certifiée. Un panorama fonctionnant dans un navigateur ne prouve pas une session XR matérielle.

Aucun benchmark de charge ou score Lighthouse n'est revendiqué. Les intégrations Vercel, DNS, fournisseur PostgreSQL, droits médias et identité juridique doivent être vérifiées sur l'environnement retenu avant ouverture.

## Résultats de la recette locale du 13 septembre 2026

- Compilation TypeScript stricte : réussie.
- Build de production Next.js : réussi.
- Intégration : 30 tests réussis.
- Langues : 6 tests réussis.
- Playwright dans Edge : 4 parcours réussis, sur serveur Next réel ; affichage mobile simulé à 390 px.
- ESLint : aucune erreur ; avertissements non bloquants, notamment sur les images natives.
- Scripts CLI sur une base isolée neuve : migrations, seed et création des comptes initiaux réussis ; deuxième exécution des migrations et du bootstrap réussie sans recréer les comptes.

Les captures accueil, dashboard et catalogue mobile ont été inspectées visuellement. Les tests navigateur ont notamment permis de corriger le conflit robots.txt et le partage des connexions de base entre routes. Ces résultats concernent le code local et les environnements décrits ci-dessus, pas un déploiement de production.