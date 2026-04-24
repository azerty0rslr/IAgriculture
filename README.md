# 🌿 AgriIA — Application de diagnostic intelligent pour l'agriculture
> Projet Bachelor 2 — Sup de Vinci × Chambre d'Agriculture

---

## 📁 Structure du projet

```
agri-ia-project/
├── backend/                  ← API Node.js + Express
│   ├── models/               ← Schémas MongoDB (User, Parcelle, Diagnostic)
│   ├── routes/               ← Endpoints API (auth, diagnostics, parcelles, admin)
│   ├── middleware/           ← Protection JWT
│   ├── server.js             ← Point d'entrée serveur
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 ← Application React
│   ├── src/
│   │   ├── components/       ← Sidebar
│   │   ├── pages/            ← LoginPage, Dashboard, Diagnostic, Parcelles, Carte, Admin
│   │   ├── services/         ← api.js (Axios), AuthContext.js
│   │   ├── App.js            ← Routeur principal
│   │   └── index.css         ← Design system complet
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── docs/
│   └── backlog-ameliore.md   ← Product Backlog Scrum (4 sprints)
│
├── docker-compose.yml        ← Orchestration complète
└── README.md
```

---

## 🚀 Démarrage rapide (développement)

### Prérequis
- Node.js 18+ et npm
- MongoDB (local ou MongoDB Atlas)

### 1. Backend
```bash
cd backend
cp .env.example .env        # Configurer les variables
npm install
npm run dev                  # Démarre sur http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start                    # Démarre sur http://localhost:3000
```

---

## 🐳 Démarrage avec Docker (production)

```bash
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:5000
- MongoDB → localhost:27017

---

## 📡 Endpoints API

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | /api/auth/inscription | Créer un compte | ❌ |
| POST | /api/auth/connexion | Se connecter (→ JWT) | ❌ |
| GET | /api/auth/moi | Profil utilisateur | ✅ |
| GET | /api/dashboard | Stats tableau de bord | ✅ |
| GET | /api/parcelles | Liste des parcelles | ✅ |
| POST | /api/parcelles | Créer une parcelle | ✅ |
| PUT | /api/parcelles/:id | Modifier une parcelle | ✅ |
| DELETE | /api/parcelles/:id | Supprimer une parcelle | ✅ |
| POST | /api/parcelles/:id/capteurs | Mise à jour IoT | ✅ |
| POST | /api/diagnostics | Lancer un diagnostic IA | ✅ |
| GET | /api/diagnostics | Historique diagnostics | ✅ |
| GET | /api/admin/users | Liste utilisateurs | ✅ 👑 |
| PUT | /api/admin/users/:id/activer | Activer/désactiver | ✅ 👑 |
| DELETE | /api/admin/users/:id | Supprimer un user | ✅ 👑 |

---

## 🤖 Module IA

Le module de diagnostic analyse les données capteurs (température, humidité, pH, luminosité) et les symptômes déclarés pour détecter :

- **Mildiou** → humidité élevée + température fraîche
- **Oïdium** → humidité faible + chaleur
- **Chlorose ferrique** → pH trop bas
- **Rouille foliaire** → conditions intermédiaires

Chaque résultat inclut : maladie détectée, probabilité (%), confiance du modèle, recommandation et traitements suggérés.

> 💡 Pour aller plus loin : intégrer un modèle scikit-learn entraîné (via Python + Flask) ou l'API OpenAI GPT-4 pour des recommandations plus précises.

---

## 🛠️ Technologies utilisées

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React.js + React Router | Framework JS vu en B2 |
| Backend | Node.js + Express | Léger, rapide, REST |
| Base de données | MongoDB + Mongoose | NoSQL adapté aux données capteurs |
| Authentification | JWT + bcrypt | Standard industriel, sécurisé |
| Cartographie | Leaflet + React-Leaflet | Open source, léger |
| Graphiques | Recharts | Compatible React |
| Déploiement | Docker + Nginx | Portabilité cloud |

---

*Sup de Vinci — Bachelor 2 — 2025/2026*
