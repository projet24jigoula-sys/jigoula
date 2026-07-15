# Plan d'Achèvement Final PFE (Projet de Fin d'Études)

Ce document trace la feuille de route exacte pour finaliser, polir et exporter la plateforme Jigoula / Loyalty Tunisia pour la soutenance.

## 1. Audit et Correction Design (UI/UX)
- [ ] **Boutons & Composants :** Inspecter l'allure des boutons sur `AuthPage`, `ScanPage`, `ClientPage`. Uniformiser les `border-radius`, `padding`, et couleurs (Teinte `#0C1F1D` vs `#297A74`).
- [ ] **Responsive Design :** S'assurer que le scan QR (vue mobile par excellence) est parfaitement dimensionné sans défilement horizontal.
- [ ] **États de Chargement (Loading) :** Ajouter des transitions douces pour éviter les sauts d'interface lors du chargement des données.

## 2. Validation End-to-End (Fonctionnalité Back & Front)
- [ ] **Client Flow (Le plus critique) :** 
  - Scan du QR -> `ScanPage`.
  - Si non connecté -> `Login` (redirection propre).
  - Validation -> Incrémentation du compteur `visits` dans le Backend.
  - Page Client -> Affichage dynamique des tampons (stamps) jusqu'à débloquer la récompense.
- [ ] **Merchant Flow :**
  - Connexion Merchant -> Affichage des statistiques API (déjà câblé).
  - Mise à jour du programme de fidélité depuis le front 2 jusqu'à la DB.
- [ ] **Admin Flow :**
  - Acceptation/Rejet des Partners (Demandes) depuis `PartnerDashboard`.

## 3. Base de Données & Demo Data (Seed)
- [ ] Injecter un script de seed final `seed_pfe.py` afin d'avoir des profils vierges et parfaits (1 Admin, 2 Merchants, 3 Clients avec historique) pour la présentation devant le jury.

## 4. Export Final "pfe aziz"
- [ ] Nettoyer les dépendances non utilisées.
- [ ] Pousser le Backend (FastAPI) et `front 2` (Vite, TSX) dans le dossier final d'exportation dédié à la soutenance (`pfe_aziz`), prêt à être glissé sur le Bureau.
