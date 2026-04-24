# 📋 Product Backlog Agile Scrum — AgriIA (Bachelor 2)
## Projet : Application mobile IA pour la Chambre d'Agriculture
### Version améliorée — Sprints 1 à 4

---

## 🎯 Vision du Produit
Développer un MVP d'application web/mobile permettant aux agriculteurs de **surveiller leurs parcelles**, **diagnostiquer les maladies** via IA, et **visualiser leurs zones à risques** sur une carte interactive.

**Stack technologique retenu :**
- Frontend : React.js (Framework JS)
- Backend : Node.js + Express (Backend/API)
- Base de données : MongoDB (BDD NoSQL)
- IA : Modèle de diagnostic simulé (scikit-learn extensible) + OpenAI API possible
- Infrastructure : Docker + AWS/Azure

---

## 🏃 Sprint 1 — Authentification & Base (Semaine 1-2)

| ID | User Story | Critères d'Acceptation | Priorité | Points |
|---|---|---|---|---|
| US-0.1 | **En tant qu'**agriculteur, **je veux** créer un compte avec mon email **afin d'**accéder à mon espace personnel. | ✅ Formulaire nom/prénom/email/mdp fonctionnel. ✅ Email unique vérifié. ✅ Mot de passe haché (bcrypt). ✅ Token JWT retourné. | **Critique** | 5 |
| US-0.2 | **En tant qu'**utilisateur, **je veux** me connecter de façon sécurisée **afin de** retrouver mes données. | ✅ Connexion par email/mdp. ✅ Redirection automatique si token valide. ✅ Session persistante 7 jours. | **Critique** | 3 |
| US-0.3 | **En tant qu'**utilisateur, **je veux** me déconnecter **afin de** sécuriser mon accès. | ✅ Bouton de déconnexion visible. ✅ Token supprimé côté client. ✅ Redirection vers /login. | **Haute** | 1 |

**Tâches techniques Sprint 1 :**
- Tech-0.1 : Mise en place du projet (React + Node + MongoDB)
- Tech-0.2 : Modèle User (MongoDB) + hachage bcrypt
- Tech-0.3 : Routes API /auth/inscription et /auth/connexion
- Tech-0.4 : Middleware JWT (protection des routes)
- Tech-0.5 : AuthContext React + gestion des routes protégées

---

## 🏃 Sprint 2 — Tableau de Bord & Parcelles (Semaine 3-4)

| ID | User Story | Critères d'Acceptation | Priorité | Points |
|---|---|---|---|---|
| US-1.1 | **En tant qu'**agriculteur, **je veux** visualiser un tableau de bord synthétique **afin de** surveiller l'état de mes parcelles en un coup d'œil. | ✅ Affichage : nombre de parcelles, surface totale, nb diagnostics. ✅ Alertes non lues visibles. ✅ 5 derniers diagnostics affichés. ✅ Graphique de répartition des risques. | **Haute** | 8 |
| US-2.1 | **En tant qu'**agriculteur, **je veux** ajouter une parcelle avec sa localisation et sa culture **afin de** commencer son suivi. | ✅ Formulaire : nom, culture, surface (ha), coordonnées GPS. ✅ Enregistrement en BDD. ✅ Parcelle visible immédiatement dans la liste. | **Haute** | 5 |
| US-2.2 | **En tant qu'**agriculteur, **je veux** consulter la liste de mes parcelles avec leur niveau de risque **afin de** prioriser mes actions. | ✅ Liste avec : nom, culture, surface, risque (badge coloré). ✅ Données capteurs affichées si disponibles. ✅ Possibilité de supprimer une parcelle. | **Haute** | 5 |
| US-2.3 | **En tant qu'**agriculteur, **je veux** simuler une lecture de capteurs IoT **afin de** tester le système de surveillance. | ✅ Bouton "Capteurs" déclenche une mise à jour simulée. ✅ Données (temp, humidité, pH, luminosité) mises à jour. ✅ Niveau de risque recalculé automatiquement. | **Moyenne** | 3 |

**Tâches techniques Sprint 2 :**
- Tech-2.1 : Modèle Parcelle (MongoDB) + calcul automatique du risque
- Tech-2.2 : Routes CRUD /api/parcelles
- Tech-2.3 : Route POST /api/parcelles/:id/capteurs (simulation IoT)
- Tech-2.4 : Route GET /api/dashboard (stats agrégées)
- Tech-2.5 : Pages React Dashboard + Parcelles

---

## 🏃 Sprint 3 — Module IA & Carte (Semaine 5-6)

| ID | User Story | Critères d'Acceptation | Priorité | Points |
|---|---|---|---|---|
| US-3.1 | **En tant qu'**agriculteur, **je veux** soumettre les données de ma parcelle au module IA **afin d'**obtenir un diagnostic de maladie. | ✅ Formulaire : culture, température, humidité, pH, luminosité. ✅ Sélection de symptômes visuels. ✅ Appel API déclenché à la soumission. ✅ Résultat affiché en < 3 secondes. | **Critique** | 8 |
| US-3.2 | **En tant qu'**agriculteur, **je veux** voir le résultat du diagnostic avec un pourcentage de probabilité **afin de** prendre une décision rapide. | ✅ Affichage : maladie détectée, probabilité en %, confiance du modèle. ✅ Barre de progression colorée. ✅ Recommandation de traitement. ✅ Actions suggérées (étiquettes). | **Critique** | 5 |
| US-3.3 | **En tant qu'**agriculteur, **je veux** consulter l'historique de mes diagnostics **afin de** suivre l'évolution des maladies. | ✅ Liste des 20 derniers diagnostics. ✅ Informations : date, culture, parcelle, résultat. ✅ Tri par date (plus récent en premier). | **Haute** | 3 |
| US-4.1 | **En tant qu'**agriculteur, **je veux** localiser mes parcelles sur une carte interactive **afin de** visualiser les zones à risques géographiquement. | ✅ Carte OpenStreetMap avec marqueurs colorés par risque. ✅ Clic sur marqueur = popup avec détails. ✅ Cercles de zone pour risques élevés/critiques. ✅ Filtres par niveau de risque fonctionnels. | **Haute** | 8 |

**Tâches techniques Sprint 3 :**
- Tech-3.1 : Modèle Diagnostic (MongoDB)
- Tech-3.2 : Algorithme de diagnostic IA (règles + scoring multi-variables)
- Tech-3.3 : Routes /api/diagnostics (POST + GET)
- Tech-3.4 : Page React Diagnostic avec sliders + sélection symptômes
- Tech-3.5 : Page React Carte avec React-Leaflet + filtres

---

## 🏃 Sprint 4 — Administration & Déploiement (Semaine 7-8)

| ID | User Story | Critères d'Acceptation | Priorité | Points |
|---|---|---|---|---|
| US-5.1 | **En tant qu'**administrateur, **je veux** voir la liste de tous les utilisateurs **afin de** superviser la plateforme. | ✅ Table avec : nom, email, rôle, région, statut, date d'inscription. ✅ Accessible uniquement avec rôle admin. ✅ Stats globales (nb users, diagnostics, parcelles). | **Haute** | 5 |
| US-5.2 | **En tant qu'**administrateur, **je veux** activer/désactiver un compte **afin d'**assurer la sécurité de la plateforme. | ✅ Bouton toggle actif/inactif. ✅ Utilisateur désactivé bloqué à la connexion. ✅ Confirmation visuelle immédiate. | **Moyenne** | 3 |
| US-5.3 | **En tant qu'**administrateur, **je veux** supprimer un compte utilisateur **afin de** gérer le RGPD. | ✅ Suppression en cascade (parcelles + diagnostics). ✅ Confirmation obligatoire. ✅ Impossible de supprimer un admin. | **Basse** | 2 |
| US-6.1 | **En tant que** chef de projet, **je veux** déployer l'application sur un cloud **afin de** la rendre accessible publiquement. | ✅ Docker Compose configuré (frontend + backend + MongoDB). ✅ Variables d'environnement externalisées (.env). ✅ Application accessible via URL publique. | **Haute** | 8 |

**Tâches techniques Sprint 4 :**
- Tech-4.1 : Routes admin /api/admin/users (GET, PUT, DELETE)
- Tech-4.2 : Page React Admin avec tableau et actions
- Tech-4.3 : Dockerfile frontend + backend
- Tech-4.4 : docker-compose.yml
- Tech-4.5 : Déploiement AWS/Azure + configuration DNS
- Tech-4.6 : Schéma d'architecture réseau (capteurs → cloud → app)

---

## 📊 Récapitulatif

| Sprint | Focus | Points | Durée |
|---|---|---|---|
| Sprint 1 | Authentification | 9 pts | 2 semaines |
| Sprint 2 | Dashboard + Parcelles | 21 pts | 2 semaines |
| Sprint 3 | IA + Carte | 24 pts | 2 semaines |
| Sprint 4 | Admin + Déploiement | 18 pts | 2 semaines |
| **Total** | **MVP complet** | **72 pts** | **8 semaines** |

---

## 🏗️ Architecture Technique Résumée

```
[Capteurs IoT simulés]
        ↓
[API REST Node.js/Express] ←→ [MongoDB Atlas]
        ↓                            ↑
[Module IA Python/JS]                |
        ↓                            |
[Frontend React] ←──────────────────┘
        ↓
[Déploiement Docker + AWS]
        ↓
[Agriculteur / Admin]
```

---

*Backlog généré dans le cadre du projet Bachelor 2 — Sup de Vinci × Chambre d'Agriculture*
