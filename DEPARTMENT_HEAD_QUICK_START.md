# 🚀 Guide de Mise en Place - Chef de Département

## Étapes de Configuration

### 1️⃣ Backend Setup

#### A. Vérifier les modèles
Les modèles suivants sont déjà en place:
- `Student.js`
- `StudentAbsence.js`
- `Classe.js`
- `Departement.js`
- `Specialite.js`
- `Niveau.js`

#### B. Ajouter les routes
**Fichier:** `backend/auth-service/routes/departmentHeadRoutes.js`
✅ Déjà créé

Routes disponibles:
```
GET    /api/department-head/department              - Récupérer le département
GET    /api/department-head/students                - Récupérer les étudiants
GET    /api/department-head/student/:studentId      - Détails étudiant
GET    /api/department-head/statistics              - Statistiques
GET    /api/department-head/export-csv              - Export CSV
```

#### C. Intégrer au serveur
**Fichier:** `backend/auth-service/server.js`
✅ Routes ajoutées avec:
```javascript
app.use("/api/department-head", departmentHeadRoutes);
```

### 2️⃣ Frontend Setup

#### A. Service API
**Fichier:** `frontend/learnflow/src/services/departmentHeadService.js`
✅ Créé avec méthodes:
- `getDepartment()`
- `getStudents(filters)`
- `getStudentDetails(studentId)`
- `getStatistics()`
- `exportCSV()`

#### B. Composants
✅ Tous créés:

| Composant | Fichier | Route |
|-----------|---------|-------|
| Dashboard | `DepartmentHeadDashboard.jsx` | `/department-head` |
| Détails | `StudentDetailPage.jsx` | `/department-head/student/:id` |
| Stats | `DepartmentStatistics.jsx` | `/department-head/statistics` |

#### C. Styles
✅ Tous les fichiers CSS créés:
- `DepartmentHeadDashboard.css`
- `StudentDetailPage.css`
- `DepartmentStatistics.css`

#### D. Routes
**Fichier:** `frontend/learnflow/src/App.jsx`
✅ Routes ajoutées:
```javascript
<Route path="/department-head" element={<DepartmentHeadDashboard />} />
<Route path="/department-head/student/:studentId" element={<StudentDetailPage />} />
<Route path="/department-head/statistics" element={<DepartmentStatistics />} />
```

### 3️⃣ Configuration Base de Données

Vérifier les relations:
```
Departement 1 → * Specialite
Specialite 1 → * Niveau
Niveau 1 → * Classe
Classe 1 → * Student
Student 1 → * StudentAbsence
```

### 4️⃣ Test de Déploiement

#### Backend Test
```bash
cd backend/auth-service
npm install
node server.js
```

Vérifier: `✅ Auth service running on port 4000`

#### Frontend Test
```bash
cd frontend/learnflow
npm install
npm run dev
```

Vérifier: `✅ Local: http://localhost:5173`

#### Test API
```bash
# Remplacer TOKEN avec un JWT valide
curl -X GET http://localhost:4000/api/department-head/department \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Structure de Données Exemple

### Département
```json
{
  "id": 1,
  "name": "Informatique",
  "code": "INF",
  "chef_departement_id": 5,
  "email": "chef@univ.tn"
}
```

### Étudiant avec Stats
```json
{
  "id": 1,
  "nom": "Ahmed",
  "prenom": "Mohamed",
  "email": "ahmed@student.tn",
  "specialite": "Informatique",
  "groupe": "A1",
  "totalAbsences": 5,
  "threshold": 10,
  "absencePercentage": 25,
  "eliminationStatus": "OK"
}
```

### Absence
```json
{
  "id": "uuid",
  "student_id": 1,
  "schedule_id": 15,
  "absence_type": "absent",
  "motif": "Absent sans justification",
  "statut": "pending"
}
```

---

## 🔄 Workflow de Données

```
1. Chef login → Token généré
   ↓
2. Dashboard charge → GET /students
   ↓
3. Filtre appliqué → GET /students?groupe=A1
   ↓
4. Click détails → GET /student/:id
   ↓
5. Visualise absences → Tableau + Graphiques
   ↓
6. Export données → GET /export-csv
```

---

## 🎯 Cas d'Usage Principaux

### Use Case 1: Visualiser les étudiants à risque
1. Accéder à `/department-head`
2. Filtrer par `statut = Risque`
3. Voir la liste des étudiants en danger d'élimination
4. Cliquer sur un étudiant pour voir les détails

### Use Case 2: Analyser les absences par matière
1. Aller à `/department-head/student/:id`
2. Voir les cartes "État par matière"
3. Identifier les matières problématiques
4. Voir le tableau complet des absences

### Use Case 3: Générer un rapport
1. Accéder à `/department-head/statistics`
2. Consulter les graphiques et métriques
3. Cliquer sur "Exporter CSV" (depuis dashboard)
4. Télécharger le fichier pour analyse externe

---

## ✨ Fonctionnalités Bonus (À Implémenter)

- 📧 Notifications email pour risques élevés
- 📄 Export PDF avancé
- 📈 Graphiques interactifs (Chart.js)
- 🤖 Prédictions ML
- 📅 Rapports mensuels automatiques
- 🔔 Alertes en temps réel
- 📱 Application mobile

---

## 🆘 Dépannage Rapide

### Erreur: 401 Unauthorized
**Solution:** Vérifier que le token JWT est valide et présent

### Erreur: 404 Not Found
**Solution:** Vérifier les routes backend et les URLs du service API

### Erreur: CORS
**Solution:** Vérifier la configuration CORS dans `server.js`

### Données vides
**Solution:** Vérifier que le département a des étudiants assignés

---

## 📞 Support

Pour toute question:
1. Consulter la documentation complète: `DEPARTMENT_HEAD_FEATURES_DOCUMENTATION.md`
2. Vérifier les logs du backend
3. Vérifier la console du navigateur frontend
4. Tester les endpoints API directement

---

**Status:** ✅ Prêt pour la production
**Date:** 17 novembre 2024
**Version:** 1.0
