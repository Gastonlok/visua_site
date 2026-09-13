> Rapport historique de la version initiale, avant la refonte. Pour le code livré ensuite et les tests réellement exécutés, consulter le [rapport de projet](sources/docs/PROJET.md) et la [validation](sources/docs/VALIDATION.md). Les constats ci-dessous décrivent la situation au moment de cet audit.
# Audit VISUA — version 6

Date : 12 septembre 2026. Périmètre : export local `sources/`, pages, styles, catalogues, traductions, routes serveur, lecteur 360°, administration et documentation. Aucun changement du site ni des données en ligne.

## Conclusion

Une base de préproduction structurée, avec un parcours découverte → fiche → contact et des protections serveur utiles. Elle n'est pas encore prête à être présentée comme une plateforme immersive congolaise pleinement opérationnelle : le catalogue repose sur des contenus éditoriaux pilotes, la démonstration immersive vient du Danemark, et le suivi commercial nécessite une consultation manuelle de l'administration.

Ce rapport repose sur la lecture du code et l'inspection des fichiers. Il ne constitue pas une validation visuelle en navigateur, une mesure Lighthouse, un audit juridique ni une qualification de casque. Les succès de tests décrits dans `sources/docs/VALIDATION.md` sont historiques, pas des tests réexécutés pendant cet audit.

## Priorités

### 1. Aligner la promesse immersive et le contenu disponible — haute

Constat : l'accueil annonce « Vivez le Congo » et la navigation « Expériences 360° », mais cette dernière ouvre le catalogue de tous les formats. Les données initiales comprennent 145 métiers, 22 destinations et un panorama de démonstration hors RDC ; les métiers et destinations sont des fiches à lire. Le caractère pilote est expliqué, ce qui évite de présenter le panorama comme une captation congolaise, mais le visiteur doit découvrir cette distinction au fil du parcours.

Action : nommer le catalogue général « Toutes les découvertes », proposer une entrée distincte « Essayer le 360° », et rendre explicite la disponibilité des fiches et des immersions. Produire une première immersion locale validée pour soutenir la promesse commerciale.

Preuves : `sources/app/ui.tsx` (Header, HomePage, Catalogue), `sources/lib/seed.ts`, `sources/lib/legacy-seed.ts`.

### 2. Organiser la réception des demandes — haute avant exploitation commerciale

Constat : le formulaire écrit dans D1 ; aucun envoi de notification ni accusé de réception par e-mail n'est implémenté. L'interface l'annonce honnêtement. La liste administrative expose uniquement les 200 dernières demandes, sans pagination : les plus anciennes deviennent inaccessibles par cette interface lorsque ce seuil est dépassé.

Action : connecter une notification avec reprise sur échec, définir qui traite les demandes et dans quel délai, ajouter pagination et filtres de suivi. Ne pas afficher un délai de réponse avant d'avoir organisé ce suivi.

Preuves : `sources/app/api/demandes/route.ts`, `sources/app/api/admin/demandes/route.ts`, `sources/app/admin/panel.tsx`.

### 3. Sécuriser la frontière d'identité lors d'un changement d'hébergement — critique si serveur exposé directement

Constat : `getChatGPTUser()` fait confiance aux en-têtes `oai-authenticated-user-*`, puis `role()` attribue les rôles selon l'adresse e-mail. Cette architecture dépend du répartiteur de confiance Sites. Un serveur accessible directement sans filtrage de ces en-têtes pourrait accepter une identité forgée correspondant à un administrateur autorisé. Le risque est déjà indiqué dans le guide d'export ; il ne prouve pas une faille du site actuellement hébergé derrière Sites.

Action : vérifier que l'origine est inaccessible hors du répartiteur et que les en-têtes entrants sont remplacés. Pour un hébergement indépendant, intégrer une authentification vérifiée côté serveur avant toute exposition.

Preuves : `sources/app/chatgpt-auth.ts:24`, `sources/lib/security.ts:2`, `LISEZ_MOI_EXPORT.md`.

### 4. Réduire le poids de l'accueil — haute pour les connexions mobiles

Constat mesuré sur disque : `congovr-hero.png` pèse 2 439 342 octets (2,44 Mo). L'accueil utilise ce fichier à toutes les tailles d'écran, sans `srcset` ni `sizes`. La priorité de chargement est correctement définie, mais elle ne réduit pas le volume transféré. Aucun temps de chargement réel n'a été mesuré.

Action : générer des variantes WebP/AVIF et des tailles adaptées aux écrans ; garder les dimensions réservées pour éviter les décalages. Comparer ensuite rendu et chargement sur un profil mobile à débit limité.

Preuves : `sources/public/images/congovr-hero.png`, `sources/app/ui.tsx` (HomePage).

### 5. Préserver un site réellement bilingue après édition — haute

Constat : les traductions sont indexées par le texte français exact dans `lib/i18n/en.json`. Un texte nouveau ou modifié dans l'administration retombe sur sa version française si l'entrée correspondante manque. La fiche continue pourtant d'afficher le badge « English » lorsque la langue de l'interface est anglaise. L'administration ne comporte pas de champs de traduction ni de statut de complétude par langue.

Action : stocker les contenus par langue avec des identifiants stables, ou ajouter à court terme une vérification des traductions lors de la publication et indiquer clairement le repli français. Conserver les tests de couverture des contenus initiaux.

Preuves : `sources/lib/i18n/text.ts`, `sources/app/admin/panel.tsx`, `sources/app/experiences/[slug]/page.tsx`.

### 6. Fiabiliser les écritures et leur journalisation — moyenne

Constat : les routes d'administration enregistrent la modification, puis écrivent séparément l'événement d'audit. Si cette seconde opération échoue, elles renvoient une erreur 503 alors que la modification a déjà été effectuée. L'utilisateur peut réessayer et rencontrer un conflit de version, ou croire qu'une suppression n'a pas eu lieu.

Action : rendre la mutation et son journal atomiques lorsque possible, ou distinguer explicitement l'échec de journalisation du résultat de la mutation. Tester une panne ciblée de l'insertion dans `audit`.

Preuves : `sources/app/api/admin/contenus/route.ts`, `sources/app/api/admin/demandes/route.ts`, `sources/lib/security.ts`.

### 7. Éviter les lectures complètes sur chaque fiche — moyenne

Constat : la page de détail et sa génération de métadonnées appellent chacune `listExperiences()`. Cette fonction vérifie les données initiales et charge tous les contenus publiés avant de chercher le slug en mémoire. L'absence de cache partagé au niveau de cette fonction multiplie le travail pour une seule fiche. Le middleware impose aussi `private, no-store` aux pages, choix compréhensible pour cette préproduction privée.

Action : interroger une fiche par slug, mutualiser la lecture par requête et déplacer l'initialisation du catalogue vers une opération explicite. Définir une stratégie de cache au moment de l'ouverture publique.

Preuves : `sources/lib/content.ts`, `sources/app/experiences/[slug]/page.tsx`, `sources/middleware.ts`.

### 8. Préparer explicitement le passage au public — haute au lancement, normale aujourd'hui

Constat : le référencement est bloqué à trois niveaux : `robots.ts`, métadonnées `robots`, en-tête `X-Robots-Tag`. C'est cohérent avec une préproduction privée. Les mentions légales et la notice de confidentialité comportent des informations à compléter. Aucun sitemap, URL canonique ou métadonnée Open Graph dédiée n'a été trouvé dans le code applicatif examiné.

Action : prévoir une configuration publique distincte ; compléter et faire valider les informations d'identité et de traitement ; préparer sitemap, URL canoniques, langues alternatives et aperçus de partage. Les règles de référencement ne sont pas une protection d'accès.

Preuves : `sources/app/robots.ts`, `sources/app/layout.tsx`, `sources/middleware.ts`, `sources/app/mentions-legales/page.tsx`, `sources/app/confidentialite/page.tsx`.

## Ergonomie et identité

- VISUA, VISUAA et CongoVR coexistent dans le logo, les titres, les textes et le bandeau. Clarifier le nom de la marque et celui de l'offre, puis harmoniser les libellés.
- Le bouton de contact de l'en-tête est masqué jusqu'à 1 500 px de largeur. Entre 961 et 1 500 px, la navigation de bureau reste visible mais ne propose pas de lien de contact direct. Garder une entrée contact accessible dans cette navigation.
- Les offres décrivent beaucoup d'éléments « à définir ». Présenter au moins un exemple concret de séance ou de livrable, avec public visé, déroulement et résultat attendu ; ajouter des références réelles lorsqu'elles existent.
- Le catalogue conserve domaine/province et famille dans l'URL, mais pas la recherche ni le format. Les filtres peuvent être perdus au rechargement ou au changement de langue. Conserver l'ensemble des critères utiles.

Preuves : `sources/app/ui.tsx`, `sources/app/globals.css:36`, `sources/app/offres/page.tsx`, `sources/app/organisations/page.tsx`.

## Points positifs à conserver

- Parcours public cohérent, fiches sourcées et distinction explicite des contenus pilotes.
- Chargement du panorama et de Three.js au clic ; alternative textuelle, commandes clavier et repli 2D prévus.
- Lien d'évitement, styles de focus, prise en compte des mouvements réduits et langue HTML synchronisée.
- Validation Zod, requêtes SQL paramétrées, contrôle d'origine, honeypot et limitation des demandes.
- Contrôle des rôles côté serveur, prévention des écrasements par version et demandes privées réservées à l'administrateur.
- Tests existants de données, autorisations, persistance et couverture des traductions.

Ces dispositions observées dans le code ne suffisent pas à certifier l'accessibilité, la sécurité du déploiement ou la compatibilité matérielle.

## Vérifications restant à réaliser

1. Installation des dépendances, TypeScript, build, lint et suites d'intégration/i18n dans cet environnement. La première installation a échoué lors d'un accès réseau au registre de paquets. La relance autorisée a téléchargé 617 paquets, puis a échoué avec `ERR_PNPM_BROKEN_METADATA_JSON` : délai dépassé pendant la vérification des métadonnées par la politique de chaîne d'approvisionnement. Cette protection n'a pas été désactivée. Les dépendances sont donc partiellement installées et aucun résultat de compilation ou de test n'est revendiqué pour cet audit.
2. Parcours réels sur ordinateur et téléphone : navigation, filtres, langue, formulaire, administration et états d'erreur.
3. Mesures de chargement et de stabilité visuelle ; contrôle des contrastes, du zoom et du clavier en navigateur.
4. Lecture WebGL réelle, vidéos et casque compatible ; la documentation antérieure décrit notamment un navigateur sans WebGL et un test de repli.
5. Vérification de l'accès privé et de l'impossibilité d'atteindre directement l'origine sur l'hébergement cible.

Ordre conseillé : clarifier l'offre et le catalogue, organiser le traitement des contacts, optimiser l'accueil, fiabiliser l'édition bilingue, puis effectuer la recette complète avant ouverture publique.
