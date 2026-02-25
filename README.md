# 🎬 Projet Cinema

Bienvenue dans le projet **Cinema**. Cette application web moderne permet de gérer une collection de films, de les noter, de les ajouter en favoris et de consulter les détails via une API externe (OMDb).

## 🚀 Installation et Lancement

Le projet est entièrement orchestré avec **Docker** pour garantir un fonctionnement identique sur toutes les machines.

### Prérequis
- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/) installés.

### Étapes de lancement
1. **Cloner le projet** :
   ```bash
   git clone <url-du-repo>
   cd Cinema
   ```

2. **Configurer l'environnement** :
   Le projet utilise une base de données **MongoDB Atlas (Cloud)** déjà configurée. Copiez simplement le fichier d'exemple :
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Démarrer l'application** :
   ```bash
   docker-compose up -d --build
   ```

4. **Accéder aux services** :
   - 🖥️ **Frontend** : [http://localhost:5173](http://localhost:5173)
   - ⚙️ **Backend API** : [http://localhost:3001](http://localhost:3001)

---

## 🔑 Identifiants de Test

Utilisez ces comptes pré-créés pour explorer les différentes fonctionnalités :

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@cinema.com` | `Admin@Cinema2026!` |
| **Utilisateur** | `user@cinema.com` | `User@Cinema2026!` |

---

## 🛠 Technologies utilisées
- **Frontend** : React, Vite, TailwindCSS, Lucide Icons.
- **Backend** : Node.js, Express, Mongoose.
- **Base de données** : MongoDB Atlas (Cloud).
- **Conteneurisation** : Docker & Docker Compose.

## 📦 Structure du projet
- `/frontend` : Code source de l'interface utilisateur.
- `/backend` : Code source de l'API et des modèles de données.
- `docker-compose.yml` : Configuration de l'orchestration des services.
