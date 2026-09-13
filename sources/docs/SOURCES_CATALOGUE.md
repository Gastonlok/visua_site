# Catalogue documentaire — septembre 2026

145 métiers en quatre domaines et 27 familles, 22 destinations classées par province avec cinq filtres thématiques et une démonstration photographique 360°. Les fiches sont éditoriales et ne promettent pas de films métiers ou de captations congolaises disponibles.

## Métiers

Navigation inspirée du catalogue Métiers360 : https://www.metiers360.com/catalogue-metiers-realite-virtuelle/ . Aucun film ni texte de fiche repris. Les références par métier sont conservées dans lib/mining-careers.json et visibles sur le site : Onisep, Gouvernement du Québec, CFP Val-d’Or, CSMO Mines. Les rôles généraux appliqués au secteur minier sont des synthèses documentaires ; diplômes et modalités locales RDC ne sont pas transposés.

## Destinations

ANAPI, Investir dans le secteur du tourisme, Cahier sectoriel, janvier 2026, 76 pages PDF. Les fiches indiquent numéros imprimés et numéros PDF et ouvrent le document à la première page pertinente. 21 nouvelles destinations et enrichissement de la fiche Kinshasa existante. Les images extraites sont attribuées au cahier fourni ; auteur et licence non indiqués, droits non supposés libres. Les conditions actuelles de voyage ne sont pas déduites du cahier. Classement selon les provinces actuelles, avec les compléments géographiques détaillés ci-dessous. Illustrations présentant des incohérences de légende exclues.

## Visuel de couverture

Panorama CongoVR fourni par l’utilisateur, nettoyé avec imagegen intégré : suppression de toute typographie, logo, slogan, URL et soulignement, préservation de la femme, du paysage, de la tour et de l’okapi. Asset public/images/congovr-hero.png, 2172×724. Ce montage est présenté comme une illustration, pas comme une photographie de la Lukenie.

## Préservation des contenus

Les identifiants et URL existants de Kinshasa et du géologue sont conservés. Le remplacement automatique ne concerne que les anciennes fiches dont le payload correspond exactement à la version initiale et dont la version vaut 1. Tout contenu modifié dans l’administration est préservé. Aucun changement du schéma de données ni de l’audience privée. Sources et familles sont éditables dans l’administration.

## Agriculture, tourisme et environnement — 12 septembre 2026

117 nouvelles fiches : 50 Agriculture / 8 familles ; 32 Tourisme / 6 familles ; 35 Environnement / 7 familles. Les 28 métiers des mines et leurs six familles sont conservés. Les nouvelles sources par fiche sont enregistrées dans `lib/additional-careers.json` : notamment Onisep, FAO, OIT, France Travail, France Compétences, OFB et organismes sectoriels. Descriptions et paragraphes originaux, sans films repris, salaires ni diplômes importés dans le contexte RDC. Certaines fonctions générales sont adaptées aux activités visées ; les habilitations locales restent à confirmer.

Le catalogue vise une couverture large des principales fonctions. Il ne constitue pas une nomenclature exhaustive de toutes les spécialisations ou appellations professionnelles. Les familles incluent notamment cultures, élevage, pêche, agronomie, semences/sols/eau, machinisme, transformation et commerce agricole ; hébergement, guides/patrimoine, voyages, restauration, animation/événements, développement touristique ; conservation, forêts, eau, déchets, pollution/HSE, énergie/climat, études/gouvernance.

## Référentiel provincial

`lib/rdc-provinces.json` contient les 26 provinces, selon l’article 2 de la Constitution publiée au Journal officiel : https://faolex.fao.org/docs/pdf/cng128142.pdf#page=6 . Orthographe normalisée pour les filtres.

`lib/destination-provinces.json` associe chacune des 22 destinations à une ou plusieurs provinces, avec sources et notes. La présentation par province répète les grands parcs dans chaque province concernée ; le compteur général conserve le nombre de lieux uniques. Le filtre présente les 26 provinces, y compris celles sans fiche disponible, avec un état vide explicite.

- Upemba : Haut-Katanga, Haut-Lomami, Lualaba. Source : gestionnaire du parc, https://www.upemba.org/fr/about .
- Kahuzi-Biega : Nord-Kivu, Sud-Kivu, Maniema. Source : site officiel ICCN/WCS, https://www.kahuzibiega.com/en-us/About/THE-PARK , rubrique Geography.
- Virunga : Nord-Kivu, Ituri, Sud-Kivu. Rapport UNESCO/UICN 2018, p. 8, https://whc.unesco.org/document/168176#page=8 : l’essentiel au Nord-Kivu, une portion à Irumu (actuelle Ituri), l’île Tshegera au Sud-Kivu.
- Salonga : Tshuapa, Mai-Ndombe, Sankuru, Kasaï. Cahier ANAPI, p. 22 imprimée / 31 PDF ; programme ISCO https://internazionale.isco-sc.it/1046/ .
- Lomami : Maniema et Tshopo retenues pour le parc proprement dit. Brochure du projet TL2/ICCN, p. 4, https://www.bonoboincongo.com/wp-content/uploads/2016/12/161210_Brochure_Reduced_Size.pdf#page=4 et appel ICCN 2024. Les divergences sont visibles dans la fiche : ANAPI ajoute Lomami ; la liste indicative UNESCO 2024 ajoute Sankuru. Aucune de ces extensions n’est traitée comme confirmée.
- Garamba : Haut-Uélé ; Kundelungu : Haut-Katanga ; Mangroves, Kisantu, Zongo, Mbanza-Ngungu, Matadi et Boma : Kongo Central ; jardin d’Eala : Équateur ; sites de la capitale et Vallée de la N’sele : Kinshasa. Sources précises ANAPI et gestionnaires conservées par lieu.

Les métadonnées enrichissent les anciennes fiches à la lecture sans remplacer leurs textes, statuts ou modifications. Toute liste provinciale explicitement enregistrée par l’administrateur est prioritaire. Le formulaire de gestion permet de modifier le domaine et les provinces, et conserve les références géographiques lors de l’enregistrement. Aucun changement de schéma D1.
