# Administration

## Accéder à son espace

Se connecter via /connexion, puis /dashboard. Chaque compte dispose d'une navigation adaptée à son rôle. Les API contrôlent séparément les permissions ; masquer un bouton n'est pas une mesure d'autorisation.

## Fiches

Créer une fiche dans « Fiches et médias ». Choisir métier, territoire, projet ou démonstration. Le slug est fixé dès le premier enregistrement pour préserver les liens. Compléter titre, résumé, contenu, lieu, domaine ou provinces, compétences et sources.

L'éditeur enregistre un brouillon et le soumet « À vérifier ». L'administrateur le passe « Vérifié », puis « Publié ». La publication exige une alternative textuelle pour les médias et les crédits des fichiers. Pour un contenu réel, les droits doivent être confirmés. Le badge pilote reste explicite pour une démonstration.

Les éditeurs ne modifient pas une fiche déjà vérifiée, publiée ou archivée. L'administrateur peut retourner un contenu vérifié en brouillon ou archiver une publication. L'archivage supprime la visibilité publique sans supprimer l'historique. Seul un brouillon peut être supprimé définitivement ; ses médias et points sont supprimés avec lui.

Un conflit de version renvoie un message demandant un rechargement. Copier les changements non enregistrés avant de recharger.

## Médias et points d'intérêt

Fournir une image locale du dossier public ou une URL HTTPS, son texte alternatif, ses crédits et sa source. Les panoramas et vidéos 360° doivent être équirectangulaires (2:1). L'hébergement doit autoriser le chargement depuis le site, notamment CORS pour les textures 360°.

Les points sont ordonnés selon leur position dans le formulaire : titre, description, angle horizontal entre −180 et 180, vertical entre −80 et 80. L'alternative textuelle reste accessible même si la 3D échoue.

Les médias ne sont pas téléversés par l'administration : ils sont référencés par URL. Aucun hébergement vidéo payant n'est configuré.

## Demandes

Les administrateurs voient toutes les demandes, par pages de 20. États : nouvelle, contactée, devis, clôturée. La suppression enlève coordonnées et message, et conserve uniquement l'action dans le journal.

Les éditeurs voient les demandes liées aux fiches dont ils sont auteurs. Les clients voient les demandes envoyées pendant leur connexion. Une demande anonyme n'est pas automatiquement rattachée après inscription.

Aucun e-mail n'est envoyé : organiser une consultation régulière du tableau de bord.

## Utilisateurs

L'administrateur crée les comptes, attribue les rôles, désactive les accès et réinitialise manuellement les mots de passe après vérification de l'identité. Transmettre les accès par un canal sûr. Les mises à jour de rôle/statut/mot de passe révoquent les sessions.

Le dernier administrateur actif ne peut être désactivé ni rétrogradé. La suppression de son propre compte doit être effectuée par un autre administrateur. Supprimer un utilisateur efface ses sessions et demandes liées ; ses fiches restent dans l'équipe.

## Paramètres et audit

Les paramètres exposent le nom de marque, le titre et la description SEO par défaut, ainsi que les redirections d'anciens chemins. La destination doit être une page publique ou une fiche publiée. Les routes applicatives réservées ne peuvent être remplacées.

SITE_URL, DATABASE_URL, AUTH_SECRET et l'ouverture publique restent des variables d'environnement, non éditables depuis l'interface. Le journal affiche date, acteur, action et cible sans copie des messages ni mots de passe.

## Tableau de bord de gestion

L’espace /dashboard dispose de sa propre navigation : le menu et le pied de page publics ne sont pas rendus sur cette route. Le lien « Ouvrir le site » permet de consulter le front public dans un nouvel onglet.

La vue administrateur regroupe les totaux, les états de publication, les demandes nouvelles, les comptes actifs, les médias enregistrés et les six dernières fiches modifiées. Les cartes ouvrent les listes filtrées ou la fiche concernée. « Créer une fiche » ouvre directement le formulaire.

Les fiches se filtrent par texte, auteur, état et type. « Médias et panoramas » montre les fiches possédant une image ou un média et donne accès à leurs adresses, crédits, alternatives et points d’intérêt. Ce panneau ne fournit pas un service de téléversement ou de stockage supplémentaire. Les demandes se filtrent par statut côté serveur, avec les mêmes restrictions par rôle que la liste complète.

Validation : connexion réelle au tableau de bord, absence des éléments publics, raccourcis, rubriques, filtres, affichage mobile et maintien du menu sur le site public vérifiés dans Edge. Les 30 tests d’intégration passent, avec vérification du filtrage des demandes et de leur confidentialité entre comptes.