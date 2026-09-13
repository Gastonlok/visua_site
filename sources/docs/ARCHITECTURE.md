# Arborescence cible

```text
app/
  catalogue/, metiers/, destinations/, experiences/[slug]/
  connexion/, inscription/, dashboard/
  api/auth/, api/demandes/, api/admin/{contenus,demandes,users,settings,audit}/
  sitemap.ts, robots.ts, [...legacy]/
db/
  schema.ts                  schéma Drizzle Postgres normalisé
  client.ts                  adaptateur SQL et transactions
  repository.ts              opérations métier et permissions de données
drizzle/postgres/             migrations versionnées (nouvelle base)
lib/
  auth.ts, permissions.ts, security.ts, seo.ts, content.ts
  seed.ts, i18n/              contenus et traductions conservés
scripts/                     migration, seed explicite, bootstrap administrateur
tests/                       Postgres isolé PGlite, routes réelles, navigateur
docs/                        livraison, sécurité, administration, exploitation
```

Les pages et API utilisent la couche métier ; seul l'adaptateur Postgres dépend du pilote pg. Une migration future vers D1 requiert un adaptateur de stockage et des migrations SQL spécifiques, pas une réécriture du front. Le changement de domaine sur Vercel ne requiert aucun changement applicatif.
