# Base Neon du projet VISUAA

Projet créé le 13 septembre 2026 : `visuaa` (`damp-heart-75945860`).
Base : `visuaa`. Branche : `production`. PostgreSQL 17, région AWS Europe Francfort (`aws-eu-central-1`).

[Ouvrir le projet dans Neon](https://console.neon.tech/app/projects/damp-heart-75945860)

La connexion est enregistrée dans `sources/.env.local`, fichier exclu du versionnement. Elle utilise le pooler Neon et vérifie le certificat TLS. Le secret de session est généré localement. Ne pas copier ces secrets dans la documentation ou le dépôt.

Pour Vercel, choisir `sources` comme répertoire racine puis renseigner `DATABASE_URL` et `AUTH_SECRET` dans les variables serveur à partir de la configuration locale. Régler `SITE_URL` sur l'origine exacte du déploiement, garder `SITE_PUBLIC=false` pendant la recette, et activer la protection du déploiement. Les variables de test ne doivent pas être configurées sur Vercel.

Les comptes applicatifs utilisent les tables du site ; ils sont distincts du rôle PostgreSQL `visuaa_owner`. La création d'un administrateur demande son adresse e-mail et l'exécution du bootstrap. Voir [le guide de déploiement](DEPLOIEMENT.md).

La création de cette base ne publie pas le site et ne modifie pas le domaine visuaa.io.

Référence : [connexion manuelle Neon et Vercel](https://neon.com/docs/guides/vercel-manual).

Validation effectuée : connexion depuis le runtime Node du projet avec TLS, deux migrations appliquées et import du catalogue terminé. La base contient 145 métiers, 22 territoires et une démonstration. Compte administrateur admin@visuaa.io créé à la demande du propriétaire ; rôle et mot de passe vérifiés. Les identifiants initiaux sont conservés uniquement dans le fichier privé .env.admin-access.local, exclu du versionnement.