# Audit de départ et migration

## État de départ

L'export v6 fournissait React/Vinext, une base D1/SQLite, des en-têtes d'identité Sites, un catalogue de fiches pilotes, un panorama danois et un formulaire sans e-mail. Les pages étaient volontairement non indexables. Il n'existait pas de compte client autonome ni de déploiement Vercel préparé.

L'audit initial est conservé dans [AUDIT_VISUA.md](../../AUDIT_VISUA.md) à titre historique ; il décrit le code avant cette refonte.

## Ce qui change

Next.js remplace Vinext. PostgreSQL remplace D1 dans le runtime. Les en-têtes d'identité ne sont plus une preuve de connexion : comptes, hash de mots de passe et sessions sont persistés. Les médias et points sont normalisés, les demandes sont reliées aux fiches et comptes, les actions sont journalisées atomiquement.

Le seed reprend les données sources, pas la base privée en ligne. Les médias présents dans public et lib/credits.json sont conservés. Les catalogues initiaux ne remplacent pas d'éventuelles modifications effectuées sur le site hébergé.

## WordPress

Aucun export WordPress ni inventaire exhaustif des URL de visuaa.io n'a été fourni. Ne pas affirmer une migration de contenu ou une couverture des redirections qui n'a pas été vérifiée.

Après export, établir une table : ancienne URL, nouvelle URL, type de contenu, média à reprendre, droits, décision conserver/fusionner/retirer. Saisir les anciens chemins dans Paramètres → Redirections. Les destinations doivent exister. L'application renvoie une redirection permanente 308 ; les chemins inconnus sans mapping restent en 404.

Les aliases internes connus /a-propos et /services sont redirigés vers /qui-sommes-nous et /organisations. Les anciennes URL WordPress à paramètres (?p=...) devront être normalisées dans l'inventaire et configurées au niveau Vercel si nécessaire ; le gestionnaire intégré traite les chemins.

Vérifier les liens entrants principaux et les variantes avec slash, accents encodés et anciennes pièces jointes sur une copie de recette. Conserver l'ancien site et les DNS de retour arrière jusqu'à validation.

## Données D1

Avant une reprise des données privées, exporter D1 et vérifier les droits d'accès à l'export. Transformer les fiches vers les tables Postgres, préserver les slugs et dates, créer les relations de médias/POI et reprendre les demandes sans les attribuer à des comptes sur la seule base de l'e-mail.

Cette opération n'a pas été exécutée : aucune donnée de production ni identité privée n'est incluse dans l'archive locale.
