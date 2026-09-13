# Déploiement Vercel puis visuaa.io

## Préparer le projet

Le livrable est préparé, mais aucun compte Vercel, serveur PostgreSQL, domaine ni DNS n'a été modifié. Une validation explicite reste nécessaire avant ouverture complète.

1. Créer un dépôt contenant ces sources. Si le dossier parent d'export est la racine Git, régler **Root Directory = sources** dans Vercel.
2. Choisir le preset Next.js, Node 24, et Corepack pour respecter pnpm 11.25.0. Le fichier vercel.json donne les commandes d'installation et de build.
3. Créer une base PostgreSQL managée (Neon ou Supabase, par exemple) et conserver une base distincte pour la préproduction. Utiliser les URL et réglages TLS du fournisseur ; privilégier son endpoint poolé pour les fonctions.
4. Définir les variables dans l'environnement Preview : DATABASE_URL, AUTH_SECRET, SITE_URL correspondant exactement à l'URL de recette, SITE_PUBLIC=false, ADMIN_EMAILS et éventuellement EDITOR_EMAILS.
5. Activer la protection du déploiement de préproduction et vérifier l'accès avec une session privée non autorisée. Un projet *.vercel.app de production peut rester public selon le périmètre de protection choisi : ne pas considérer noindex comme un mot de passe.
6. Appliquer les migrations, le seed et le bootstrap depuis un environnement opérateur autorisé avec les variables de **préproduction**. Retirer ensuite ADMIN_BOOTSTRAP_PASSWORD.
7. Déployer sur la branche de préproduction et exécuter les parcours de recette, notamment la connexion et les mutations avec l'origine SITE_URL exacte.

Un build ne lance pas de migrations et ne crée pas d'administrateur. Le code ne lit aucune identité Sites ou ChatGPT.

## Variables

| Variable | Usage |
|---|---|
| DATABASE_URL | Connexion PostgreSQL, jamais publique |
| AUTH_SECRET | Secret aléatoire d'au moins 32 caractères |
| SITE_URL | Origine absolue, sans sous-chemin ni query |
| SITE_PUBLIC | false en recette ; true après validation |
| ADMIN_EMAILS | Adresses à créer par db:bootstrap |
| EDITOR_EMAILS | Éditeurs initiaux facultatifs |
| ADMIN_BOOTSTRAP_PASSWORD | Temporaire, uniquement pour le provisioning |
| NEXT_PUBLIC_* | Aucune variable requise dans cette version |

Les variables VISUA_TEST_DATABASE utilisées par la recette locale ne doivent jamais être définies en production. Le code refuse ce backend lorsque NODE_ENV=production.

## Bascule du domaine — après autorisation

- Exporter WordPress et sa liste réelle d'URL ; créer et tester les redirections. Ne pas inventer une correspondance d'anciennes pages.
- Sauvegarder la base et les médias, noter les DNS actuels et préparer un retour arrière.
- Ajouter visuaa.io au projet Vercel. Appliquer uniquement les enregistrements DNS demandés dans la console pour ce domaine ; aucun A/CNAME universel n'est présumé.
- Régler SITE_URL sur l'origine canonique choisie (exemple : https://visuaa.io), définir la redirection www/apex au niveau du domaine et redéployer.
- Après validation du contenu, des documents, des accès et du SEO, passer SITE_PUBLIC=true.
- Tester HTTP→HTTPS, canonicals, hreflang, sitemap, robots, anciennes URL, cookies, connexion, formulaire et dashboards. Un changement de domaine demande une nouvelle connexion : les cookies ne sont pas transférés entre origines.
- Conserver le déploiement précédent pour un rollback ; ne pas supprimer immédiatement l'ancien hébergement WordPress.

Le code applicatif ne change pas : uniquement domaine, variables, redirections et redéploiement.

## Références officielles

[Node.js sur Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [gestionnaires de paquets et Corepack](https://vercel.com/docs/package-managers), [Deployment Protection](https://vercel.com/docs/deployment-protection), [ajout d'un domaine](https://vercel.com/docs/domains/working-with-domains/add-a-domain).
