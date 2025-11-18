# 🚀 Guide de Déploiement - Chef de Département

## Pre-Deployment Checklist

### ✅ Backend Checks

- [x] Routes implémentées dans `departmentHeadRoutes.js`
- [x] Routes intégrées au serveur principal
- [x] Modèles Sequelize synchronisés
- [x] Middleware d'authentification en place
- [x] CORS configuré pour le frontend
- [x] Gestion d'erreurs implémentée
- [x] Requêtes validées
- [x] Base de données migrated

### ✅ Frontend Checks

- [x] Service API créé et configuré
- [x] Composants React créés
- [x] Styles CSS appliqués
- [x] Routes React ajoutées dans App.jsx
- [x] Navigation fonctionnelle
- [x] Gestion des erreurs
- [x] Responsive design testé
- [x] Authentification vérifiée

### ✅ Base de Données

- [x] Tables existantes
  - `auth.utilisateur`
  - `referentiels.student`
  - `referentiels.student_absence`
  - `referentiels.classe`
  - `referentiels.niveau`
  - `referentiels.specialite`
  - `referentiels.departement`
  - `referentiels.schedule`
  - `referentiels.matiere`

---

## 🔧 Configuration Pré-Déploiement

### 1. Backend Configuration

#### Fichier: `backend/auth-service/server.js`
```javascript
// ✅ Routes ajoutées
app.use("/api/department-head", departmentHeadRoutes);

// ✅ CORS configuré
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
```

#### Fichier: `backend/auth-service/.env`
Vérifier les variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learnflow
DB_USER=postgres
DB_PASS=password
JWT_SECRET=alex
PORT=4000
```

### 2. Frontend Configuration

#### Fichier: `frontend/learnflow/src/services/departmentHeadService.js`
```javascript
// ✅ URL configurée
const API_URL = 'http://localhost:4000/api/department-head';

// ✅ Authentification en place
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

#### Fichier: `frontend/learnflow/src/App.jsx`
```javascript
// ✅ Routes ajoutées
<Route path="/department-head" element={<DepartmentHeadDashboard />} />
<Route path="/department-head/student/:studentId" element={<StudentDetailPage />} />
<Route path="/department-head/statistics" element={<DepartmentStatistics />} />
```

---

## 🏃 Procédure de Déploiement

### Étape 1: Préparation du Backend

```bash
# 1. Naviguer au dossier backend
cd backend/auth-service

# 2. Installer les dépendances
npm install

# 3. Vérifier la base de données
npm run migrate  # (si applicable)

# 4. Démarrer le serveur
node server.js

# ✅ Vérifier: "Auth service running on port 4000"
```

### Étape 2: Préparation du Frontend

```bash
# 1. Naviguer au dossier frontend
cd frontend/learnflow

# 2. Installer les dépendances
npm install

# 3. Build pour production (optionnel)
npm run build

# 4. Démarrer le serveur de développement
npm run dev

# ✅ Vérifier: "Local: http://localhost:5173"
```

### Étape 3: Tests de Connexion

#### Test 1: Vérifier les routes backend
```bash
curl -X GET http://localhost:4000/api/department-head/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test 2: Vérifier l'API frontend
Ouvrir la console du navigateur:
```javascript
// Dans la console
import departmentHeadService from './services/departmentHeadService';
departmentHeadService.getStatistics().then(data => console.log(data));
```

#### Test 3: Accéder aux pages
- Dashboard: http://localhost:5173/department-head
- Détails: http://localhost:5173/department-head/student/1
- Stats: http://localhost:5173/department-head/statistics

---

## 📋 Plan de Test

### Test Fonctionnel 1: Dashboard
```
1. ✅ Page charge correctement
2. ✅ Tableau affiche les étudiants
3. ✅ Filtres fonctionnent (groupe, spécialité, statut)
4. ✅ Recherche fonctionne
5. ✅ Badges de couleur affichés correctement
6. ✅ Bouton "Voir détails" redirige
7. ✅ Export CSV télécharge le fichier
```

### Test Fonctionnel 2: Détails Étudiant
```
1. ✅ Infos générales affichées
2. ✅ Cartes par matière chargent
3. ✅ Tableau d'absences popuplé
4. ✅ Stats résumées correctes
5. ✅ Bouton retour fonctionne
6. ✅ Couleurs cohérentes avec statut
```

### Test Fonctionnel 3: Statistiques
```
1. ✅ Métriques clés affichées
2. ✅ Graphiques rendus correctement
3. ✅ Pie chart affiche répartition
4. ✅ Bar charts affichent tendances
5. ✅ Tableau détaillé complet
6. ✅ Pourcentages calculés correctement
```

### Test Non-Fonctionnel
```
1. ✅ Performance: Chargement < 2s
2. ✅ Responsive: Mobile, Tablet, Desktop
3. ✅ Sécurité: Authentification requise
4. ✅ Accessibilité: Navigation au clavier
5. ✅ Compatibilité: Tous les navigateurs
6. ✅ Erreurs: Gestion correcte
```

---

## 🐛 Dépannage de Déploiement

### Problème: Erreur 401 Unauthorized
**Cause:** Token JWT invalide ou absent
**Solution:**
```javascript
// Vérifier le token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Faire une nouvelle connexion
window.location.href = '/auth';
```

### Problème: Erreur 404 Not Found
**Cause:** Routes non enregistrées
**Solution:**
```bash
# 1. Vérifier que departmentHeadRoutes.js existe
ls backend/auth-service/routes/departmentHeadRoutes.js

# 2. Vérifier qu'il est importé dans server.js
grep -n "departmentHeadRoutes" backend/auth-service/server.js

# 3. Redémarrer le serveur
```

### Problème: Erreur CORS
**Cause:** CORS mal configuré
**Solution:**
```javascript
// backend/auth-service/server.js
app.use(cors({ 
  origin: "http://localhost:5173", 
  credentials: true 
}));
```

### Problème: Données vides
**Cause:** Pas de données dans la base de données
**Solution:**
```bash
# 1. Vérifier la base de données
psql -U postgres -d learnflow

# 2. Vérifier les données
SELECT COUNT(*) FROM referentiels.student;
SELECT COUNT(*) FROM referentiels.student_absence;

# 3. Insérer des données de test si nécessaire
```

### Problème: Graphiques ne s'affichent pas
**Cause:** Canvas API non supportée
**Solution:**
```javascript
// Vérifier la console pour les erreurs
console.error('Canvas Error:', error);

// Vérifier les données
console.log('Chart Data:', chartData);
```

---

## 📊 Checklist Post-Déploiement

- [ ] Backend active et accessible
- [ ] Frontend charge correctement
- [ ] Authentification fonctionne
- [ ] Tous les endpoints répondent
- [ ] Données affichées correctement
- [ ] Filtres fonctionnent
- [ ] Export CSV fonctionne
- [ ] Graphiques s'affichent
- [ ] Responsive design OK
- [ ] Pas d'erreurs en console
- [ ] Performance acceptable
- [ ] Utilisateurs peuvent accéder

---

## 🔄 Mise à jour et Maintenance

### Sauvegardes
```bash
# Sauvegarder la base de données
pg_dump -U postgres -d learnflow > backup_$(date +%Y%m%d).sql

# Sauvegarder les fichiers
tar -czf learnflow_backup_$(date +%Y%m%d).tar.gz backend/ frontend/
```

### Mises à jour
```bash
# Backend
cd backend/auth-service
git pull origin main
npm install
npm run migrate
# Redémarrer

# Frontend
cd frontend/learnflow
git pull origin main
npm install
npm run build
# Redéployer
```

---

## 📞 Contacts et Support

### En cas de problème:
1. Consulter les logs: `npm run logs` (si configuré)
2. Vérifier la base de données
3. Vérifier les erreurs en console
4. Consulter la documentation
5. Contacter l'équipe de développement

### Logs Importants
- Backend: Port 4000
- Frontend: Port 5173
- Database: Port 5432

---

## ✅ Validation Final

Avant de déclarer le déploiement complet:

```bash
# 1. Vérifier le backend
curl -s http://localhost:4000/api/department-head/statistics \
  -H "Authorization: Bearer TOKEN" | jq .

# 2. Vérifier le frontend
curl -s http://localhost:5173 | head -20

# 3. Vérifier la base de données
psql -U postgres -d learnflow -c "SELECT COUNT(*) FROM referentiels.student;"

# 4. Vérifier les services
ps aux | grep -E "node|npm"

# Si tout est ✅, le déploiement est réussi!
```

---

**Status:** ✅ Prêt pour Production
**Date:** 17 novembre 2024
**Version:** 1.0
