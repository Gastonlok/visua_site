# VISUAA — Métiers & territoires

Application Next.js / React 19 pour découvrir les métiers, territoires et projets de la RDC, explorer un panorama et demander une démonstration. Front public, comptes utilisateurs et tableaux de bord **admin / editor / viewer**.

Cette refonte remplace l'ancien runtime Sites/Vinext/D1. Les contenus, médias locaux et traductions existants sont conservés : 145 métiers, 22 territoires et la démonstration Forest Tower (Danemark). Cette dernière n'est pas une captation congolaise.

## Architecture

TypeScript strict, Next.js App Router, SSR, PostgreSQL, schéma et migrations Drizzle. Sessions opaques stockées en base et mots de passe hashés avec scrypt. Three.js est chargé seulement après activation du lecteur. Aucun paiement, e-mail automatique ou hébergement vidéo payant.

Voir [l'arborescence](docs/ARCHITECTURE.md) et [les décisions](docs/PROJET.md).

## Démarrer

Node **24 recommandé**, Node **22.15+** minimum pour les scripts de test. Corepack et pnpm **11.25.0**, fixé dans package.json. Fournir une base PostgreSQL locale ou managée, isolée de la production.

Depuis ce dossier :

```sh
corepack pnpm install --frozen-lockfile
```

Copier `.env.example` vers `.env.local` (`Copy-Item .env.example .env.local` sous PowerShell). Renseigner DATABASE_URL, SITE_URL et AUTH_SECRET. Pour générer AUTH_SECRET : `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Ne jamais publier cette valeur.

```sh
corepack pnpm run build
corepack pnpm run db:migrate
corepack pnpm run db:seed
corepack pnpm run db:bootstrap
corepack pnpm run dev
```

Ouvrir l'origine exacte de SITE_URL (par défaut http://localhost:3000). Un accès via 127.0.0.1 avec SITE_URL réglée sur localhost ne permet pas les formulaires : le contrôle d'origine est volontairement strict.

Avant `db:bootstrap`, renseigner ADMIN_EMAILS et ADMIN_BOOTSTRAP_PASSWORD (12–128 caractères). Le script crée uniquement les comptes absents ; il ne promeut jamais un compte existant. EDITOR_EMAILS est facultatif. Supprimer ADMIN_BOOTSTRAP_PASSWORD après usage et changer les mots de passe initiaux dans « Mon compte ».

Les migrations et le seed sont explicites, transactionnels et répétables. Aucun seed ni mutation n'est déclenché en consultant une page. Les migrations historiques SQLite de l'export ne doivent **pas** être appliquées à PostgreSQL.

## Vérifier

```sh
node node_modules/typescript/bin/tsc --noEmit
node --import ./tests/loader.mjs tests/integration.mjs
corepack pnpm run test:i18n
corepack pnpm run lint
corepack pnpm run build
corepack pnpm run test:e2e
```

L'intégration utilise les routes réelles et un PostgreSQL PGlite isolé en mémoire. Les tests navigateur créent une base locale indépendante et démarrent Next sur 127.0.0.1:3100. Sous Windows, ils utilisent Edge installé ; ailleurs, exécuter `corepack pnpm exec playwright install chromium` avant la première recette. Ils ne testent pas un casque physique. Détails : [VALIDATION.md](docs/VALIDATION.md).

## Parcours

- Visiteur : accueil → catalogue filtrable et paginé → fiche SSR → 360° ou texte → demande enregistrée.
- Client : inscription ou connexion → demandes envoyées pendant sa connexion → changement de mot de passe.
- Éditeur : création, médias, points d'intérêt, soumission pour vérification ; consultation des demandes liées à ses fiches.
- Administrateur : vérification, publication, archivage, comptes et rôles, demandes, paramètres SEO, redirections, audit.

## Déploiement

Vercel, racine du projet : **sources** si le dépôt contient le dossier d'export. Le fichier vercel.json fixe les commandes Corepack. Configurer PostgreSQL et les variables avant le déploiement. Les migrations ne sont jamais lancées automatiquement par un build.

SITE_URL définit toutes les URL canoniques, le sitemap, Open Graph et l'origine autorisée pour les mutations. SITE_PUBLIC=false empêche l'indexation, mais **ne protège pas l'accès** : utiliser Deployment Protection sur la préproduction. Le passage à visuaa.io ne nécessite que configuration du domaine, variables et redirections, puis redéploiement. Voir [DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

## Documentation

- [Livraison et décisions](docs/PROJET.md)
- [Migration WordPress](docs/AUDIT_MIGRATION.md)
- [Administration](docs/ADMINISTRATION.md)
- [Déploiement](docs/DEPLOIEMENT.md)
- [Exploitation et restauration](docs/EXPLOITATION.md)
- [Sécurité et permissions](docs/SECURITE.md)
- [Validation](docs/VALIDATION.md)
- [Hypothèses commerciales](docs/COMMERCIAL.md)
- [Backlog et validations préalables](docs/BACKLOG.md)
- [Langues](docs/LANGUAGES.md)
- [Crédits](lib/credits.json)

## Avant ouverture publique — validation explicite requise

Importer les médias avec leurs droits ; faire relire contenus et documents juridiques ; valider la marque et les licences ; définir le traitement des demandes et la conservation des données ; exporter WordPress et vérifier les redirections ; vérifier SEO, accès, sécurité, mobiles et casque réel.

Les notifications commerciales restent hors V1 : leur configuration et leurs tests nécessiteront une validation ultérieure. La bascule DNS et l'ouverture publique complète ne sont pas exécutées par cette livraison.
