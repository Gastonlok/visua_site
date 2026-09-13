# Sécurité et permissions

## Matrice

| Action | Public | Viewer/client | Editor | Admin |
|---|---|---|---|---|
| Fiches publiées / panorama | Oui | Oui | Oui | Oui |
| Envoyer une demande | Oui | Oui, liée au compte | Oui | Oui |
| Lire les demandes | Non | Ses demandes authentifiées | Fiches dont il est auteur | Toutes |
| Créer / modifier brouillon ou soumission | Non | Non | Oui, équipe | Oui |
| Vérifier / publier / archiver | Non | Non | Non | Oui |
| Supprimer un brouillon | Non | Non | Non | Oui |
| Modifier / supprimer une demande | Non | Non | Non | Oui |
| Gérer comptes et rôles | Non | Non | Non | Oui |
| Paramètres / audit | Non | Non | Non | Oui |
| Changer son mot de passe | Non | Oui | Oui | Oui |

## Authentification

Mot de passe 12–128 caractères, scrypt N=32768, r=8, p=1, sel aléatoire, comparaison en temps constant. Aucun mot de passe clair stocké. Token de session aléatoire de 256 bits ; seule son empreinte HMAC avec AUTH_SECRET est conservée. Cookie HttpOnly, SameSite=Lax, Secure lorsque SITE_URL est HTTPS, expiration à sept jours.

Les rôles et le statut sont relus en base à chaque requête. Le changement de rôle, la désactivation, le changement de mot de passe ou la déconnexion révoquent les sessions correspondantes. La rotation d'AUTH_SECRET invalide aussi les sessions.

Les anciens en-têtes oai-authenticated-user-* sont ignorés et retirés du contexte transmis par le proxy. Ils ne peuvent pas conférer un accès. ADMIN_EMAILS et EDITOR_EMAILS ne servent qu'au script de bootstrap ; les inscriptions aux adresses réservées sont refusées.

L'inscription publique crée uniquement un viewer. Sans vérification d'adresse par mail, un e-mail déclaré n'est pas une preuve de propriété : aucune demande anonyme ni donnée existante n'est attribuée par correspondance d'e-mail. Pour récupérer un compte, une vérification manuelle hors application est nécessaire.

## API

Contrôle strict de l'Origin contre SITE_URL, Content-Type JSON, lecture bornée à 60 Ko, validation Zod, requêtes SQL paramétrées, réponses privées sans cache. Limites persistantes en base pour inscriptions, connexions, changements de mot de passe et demandes. Les empreintes de limitation sont supprimées à expiration lors des appels suivants.

Sur Vercel, l'adresse réseau vient de x-vercel-forwarded-for remplacé par la plateforme. Hors Vercel, le bucket réseau est partagé : adapter explicitement la frontière réseau de confiance avant une exploitation à fort trafic. Ne pas faire confiance à x-forwarded-for fourni librement.

Une demande réutilisant son UUID avec le même contenu est idempotente ; un contenu différent est refusé. Le lien au compte vient exclusivement de la session. Les mutations administratives et leur audit sont transactionnels.

## En-têtes

CSP limitant objets, formulaires et frames ; X-Frame-Options DENY ; nosniff ; politique de référent ; caméra, microphone et géolocalisation désactivés. La CSP garde unsafe-inline pour les scripts de démarrage Next et les styles ; unsafe-eval est limité au développement. Une CSP par nonce est une amélioration possible, pas une protection déjà revendiquée.

## Données personnelles et exploitation

La suppression des demandes efface leurs coordonnées et messages. La suppression d'un compte efface ses demandes liées et sessions ; le journal garde les actions sans relation à l'utilisateur supprimé. Les sauvegardes suivent leur propre cycle de rétention, à définir avant ouverture. Les administrateurs peuvent traiter des données personnelles : limiter leurs comptes et protéger l'accès au fournisseur de base et à Vercel.

La durée de conservation, l'identité du responsable et les régions de traitement restent à valider. Ce document décrit les mesures implémentées, sans certifier la conformité juridique. Aucun secret n'est exposé via NEXT_PUBLIC_*.
