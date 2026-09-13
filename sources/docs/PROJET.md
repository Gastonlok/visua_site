# Rapport de livraison et décisions

## Produit

La refonte conserve l'identité visuelle et le catalogue éditorial existant, puis ajoute les comptes et espaces de travail demandés. Le catalogue général est distingué de l'entrée « Essayer le 360° ». Les fiches initiales restent identifiées comme pilotes. La plateforme ne promet pas que les 167 fiches métiers/territoires disposent d'une captation.

## Choix techniques

1. **Next.js natif** remplace Vinext et la couche Sites. React 19, App Router, rendu serveur, routes API exécutées sur le runtime Node. Le runtime edge n'apporte pas d'avantage ici : PostgreSQL et scrypt requièrent un runtime serveur adapté.
2. **PostgreSQL + Drizzle** : tables users, sessions, fiches, media, points_of_interest, requests, audit_log, settings et rate_limits. Le contenu principal et les relations sont normalisés ; les métadonnées éditoriales extensibles restent en JSONB. Les migrations sont générées par Drizzle, appliquées par un exécuteur transactionnel avec suivi des empreintes.
3. **Stockage isolé du front** : db/client.ts définit la connexion et les transactions ; db/repository.ts gère les fiches, médias, points et audit. Les API de gestion utilisent cette connexion abstraite. D1 n'est pas un backend opérationnel dans cette version : son adaptation devra traduire les particularités SQL Postgres et fournir ses migrations. Aucune dépendance Cloudflare ne subsiste dans le chemin applicatif.
4. **Authentification e-mail/mot de passe** sans envoi de courriel. Sessions aléatoires opaques, empreintes HMAC côté base, cookie HttpOnly et rôles lus en base. Les listes d'e-mails servent uniquement au provisioning initial, jamais à l'autorisation d'une requête.
5. **Clients** : inscription libre au rôle viewer seulement. L'adresse n'est pas vérifiée par mail ; aucun rattachement des anciennes demandes par simple égalité d'adresse. Le compte authentifié, et lui seul, détermine le lien avec une demande.
6. **Cycle éditorial** : brouillon → à vérifier → vérifié → publié → archivé. Vérification, publication et archivage réservés à l'administrateur. Un contenu archivé peut revenir en brouillon. La suppression définitive concerne les brouillons.
7. **Mutations atomiques** : médias, points, contenu et audit partagent la transaction. Version optimiste et verrouillage empêchent l'écrasement d'une édition concurrente.
8. **SSR et SEO** : pages et fiches rendues à la demande ; métadonnées, canonicals, Open Graph, JSON-LD, sitemap et robots. Les filtres sont dans l'URL et la pagination fonctionne sans JavaScript. Le catalogue actuel est filtré sur le serveur après lecture des 168 entrées ; une recherche SQL indexée pourra remplacer cette étape si le volume augmente.
9. **Médias** : URLs locales ou HTTPS, licences et crédits, panorama 2:1, chargement à la demande, texte accessible visible indépendamment du lecteur. Aucun téléversement vers un stockage payant n'est ajouté.
10. **Préproduction** : SITE_PUBLIC=false par défaut. Ce réglage agit sur l'indexation, pas sur les permissions d'accès. La protection de la préproduction relève de Vercel.
11. **Langues** : traduction existante conservée ; dictionnaire indexé par texte source. Une fiche modifiée sans traduction présente un badge de langue française. L'édition multilingue structurée reste une amélioration distincte.
12. **Navigation** : navigation de document assumée pour relire session et langue à chaque page. Aucun cache partagé n'est utilisé pour les tableaux de bord.

## Périmètre livré

Front public, formulaire, authentification, dashboards, CRUD et workflow de fiches, médias et POI, demandes et suppression des données, comptes et rôles, paramètres SEO et marque, redirections d'anciens chemins, audit, migrations, seed, bootstrap, tests et documentation.

Aucun déploiement, changement DNS, import des données privées de la production ou ouverture publique n'a été exécuté.

## Références techniques

[NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response), [PostgreSQL avec Drizzle](https://orm.drizzle.team/docs/get-started-postgresql), [migrations Drizzle](https://orm.drizzle.team/docs/migrations), [API PGlite](https://pglite.dev/docs/api).

## Identité communiquée par le propriétaire

Raison sociale / dénomination utilisée : **VISUA SARL**. Cette information est intégrée aux mentions légales. Adresse officielle et responsable / directeur de publication : **à confirmer**, conformément à la réponse du propriétaire ; aucune coordonnée officielle supplémentaire ne doit être déduite.