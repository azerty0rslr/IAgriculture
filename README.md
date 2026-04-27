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
│   ├── public/
│   │   └── index.html
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
- MongoDB Community Server installé localement
- Une clé API OpenAI (https://platform.openai.com)

### 1. Backend
```
cd backend
npm install
npm run dev
```
Démarre sur http://localhost:5000

### 2. Frontend (dans un 2ème terminal)
```
cd frontend
npm install
npm start
```
Démarre sur http://localhost:3000

> ⚠️ Sur Windows PowerShell, taper les commandes une par une.

---

## ⚙️ Configuration — fichier `.env`

Créer le fichier `backend/.env` (copier depuis `.env.example`) :

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/agri-ia
JWT_SECRET=agri_ia_secret_key_2025
NODE_ENV=development
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

| Variable | Description |
|---|---|
| MONGO_URI | URL de connexion MongoDB (local ou Atlas) |
| JWT_SECRET | Clé secrète pour signer les tokens JWT |
| OPENAI_API_KEY | Clé API OpenAI (https://platform.openai.com) |
| OPENAI_MODEL | Modèle OpenAI utilisé (défaut : gpt-4o-mini) |

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
| POST | /api/parcelles/:id/capteurs | Mise à jour IoT simulée | ✅ |
| POST | /api/diagnostics | Lancer un diagnostic IA | ✅ |
| GET | /api/diagnostics | Historique diagnostics | ✅ |
| GET | /api/diagnostics/:id | Détail d'un diagnostic | ✅ |
| GET | /api/admin/users | Liste utilisateurs | ✅ 👑 |
| PUT | /api/admin/users/:id/activer | Activer/désactiver un user | ✅ 👑 |
| DELETE | /api/admin/users/:id | Supprimer un user | ✅ 👑 |
| GET | /api/admin/stats | Stats globales admin | ✅ 👑 |

---

## 🤖 Module IA — OpenAI GPT-4o-mini

Le diagnostic IA est géré dans `backend/routes/diagnostics.js`.

### Fonctionnement
Quand un agriculteur soumet un diagnostic, le backend envoie un prompt structuré à OpenAI GPT-4o-mini avec les données capteurs (température, humidité, pH, luminosité), les symptômes visuels observés et le type de culture.

GPT-4o-mini répond en JSON structuré avec :
- Maladie détectée (ex: Mildiou, Oïdium, Chlorose ferrique...)
- Probabilité (0-100%)
- Confiance du modèle (0-100%)
- Recommandation détaillée en français
- Traitements suggérés

### Sécurité
- Les symptômes sont nettoyés avant envoi (anti-injection)
- En cas d'échec OpenAI, un résultat de secours (fallback) est automatiquement sauvegardé en base avec statut "erreur"
- Le modèle est configurable via OPENAI_MODEL dans .env

### Exemple de réponse IA
```json
{
  "maladie": "Mildiou",
  "probabilite": 87,
  "confiance": 92,
  "recommandation": "Appliquer un fongicide à base de cuivre. Améliorer la ventilation des plants.",
  "traitements": ["Fongicide cuivrique", "Réduction humidité", "Surveillance renforcée"]
}
```

---

## 👤 Créer un compte Administrateur

1. S'inscrire sur http://localhost:3000
2. Ouvrir MongoDB Compass → base agri-ia → collection users
3. Trouver le document correspondant
4. Modifier le champ role : "agriculteur" → "admin"
5. Se reconnecter — le menu Administration apparaît dans la sidebar

---

## 🛠️ Technologies utilisées

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React.js + React Router | Framework JS vu en B2 |
| Backend | Node.js + Express | Léger, rapide, REST |
| Base de données | MongoDB + Mongoose | NoSQL adapté aux données capteurs |
| Authentification | JWT + bcrypt | Standard industriel, sécurisé |
| Intelligence Artificielle | OpenAI GPT-4o-mini | Diagnostic agronomique précis en français |
| Cartographie | Leaflet + React-Leaflet | Open source, léger |
| Graphiques | Recharts | Compatible React |
| Déploiement | Docker + Nginx | Portabilité cloud |

---

## 🚀 Déploiement en production (à venir)

| Service | Plateforme | Coût |
|---|---|---|
| Base de données | MongoDB Atlas | Gratuit |
| Backend | Render | Gratuit |
| Frontend | Vercel | Gratuit |

---

*Sup de Vinci — Bachelor 2 — 2025/2026*