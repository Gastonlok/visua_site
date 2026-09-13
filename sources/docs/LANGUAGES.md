# Français / English

Le sélecteur de langue conserve les paramètres de catalogue dans l'URL. Le choix est mémorisé un an dans un cookie HttpOnly. La langue du document et les métadonnées suivent le choix.

Les 168 contenus initiaux disposent de traductions dans lib/i18n/en.json. Les valeurs techniques (identifiants, slugs, rôles, états) ne sont pas traduites. Les sources documentaires gardent leur langue originale.

Le dictionnaire utilise le texte français comme clé. Après une modification éditoriale, ajouter la nouvelle traduction ; faute de correspondance, le texte français reste affiché et le badge de la fiche signale ce repli. Les nouveaux tableaux de bord sont rédigés en français ; une localisation complète des espaces de gestion n'est pas une fonctionnalité revendiquée en V1.

Commandes : `corepack pnpm run test:i18n`. Les tests vérifient la couverture des contenus initiaux, les URL, les attributs et la conservation des événements et valeurs.
