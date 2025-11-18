# 🎓 Chef de Département - Gestion des Absences & Éliminations

## 📋 Vue d'ensemble

Ce module fournit une suite complète de fonctionnalités permettant aux chefs de département de gérer les absences et les éliminations des étudiants de leur département.

## 🎯 Objectifs

✅ Avoir une vue complète sur les étudiants du département
✅ Suivre les absences en temps réel
✅ Identifier les étudiants à risque d'élimination
✅ Analyser les statistiques d'absentéisme
✅ Exporter les données pour rapports

---

## 🏗️ Architecture

### Backend Structure

```
backend/auth-service/routes/
├── departmentHeadRoutes.js  (NEW - Routes spécifiques au chef)
├── authRoutes.js
└── ...

backend/Reference_documents/models/
├── Student.js              (Modèle étudiant)
├── StudentAbsence.js       (Modèle absences)
├── Classe.js               (Modèle classe)
├── Departement.js          (Modèle département)
└── ...
```

### Frontend Structure

```
frontend/learnflow/src/
├── services/
│   └── departmentHeadService.js     (NEW - Service API)
├── components/
│   ├── DepartmentHeadDashboard.jsx  (NEW - Dashboard principal)
│   ├── DepartmentHeadDashboard.css
│   ├── StudentDetailPage.jsx        (NEW - Page détails étudiant)
│   ├── StudentDetailPage.css
│   ├── DepartmentStatistics.jsx     (NEW - Page statistiques)
│   ├── DepartmentStatistics.css
│   └── ...
└── App.jsx (UPDATED - Routes ajoutées)
```

---

## 📡 API Endpoints

### 1. Récupérer le département
```
GET /api/department-head/department
```
**Réponse:**
```json
{
  "id": 1,
  "name": "Informatique",
  "code": "INF",
  "chef_departement_id": 5,
  "email": "chef@example.com",
  ...
}
```

### 2. Récupérer les étudiants du département
```
GET /api/department-head/students?groupe=A1&specialite=informatique&statut=OK&search=Ahmed
```

**Paramètres de filtrage:**
- `groupe` - Filtrer par groupe (optionnel)
- `specialite` - Filtrer par spécialité (optionnel)
- `statut` - Filtrer par statut: OK, Risque, Éliminé (optionnel)
- `search` - Rechercher par nom/prénom (optionnel)

**Réponse:**
```json
[
  {
    "id": 1,
    "nom": "Ahmed",
    "prenom": "Mohamed",
    "email": "ahmed@example.com",
    "specialite": "Informatique",
    "groupe": "A1",
    "totalAbsences": 5,
    "threshold": 10,
    "absencePercentage": 25,
    "eliminationStatus": "OK",
    "statut": "actif"
  },
  ...
]
```

### 3. Récupérer les détails d'un étudiant
```
GET /api/department-head/student/:studentId
```

**Réponse:**
```json
{
  "student": {
    "id": 1,
    "nom": "Ahmed",
    "prenom": "Mohamed",
    "email": "ahmed@example.com",
    "specialite": "Informatique",
    "groupe": "A1"
  },
  "absences": [
    {
      "date": "2024-11-15",
      "subject": "Programmation Web",
      "horaire": "08:00 - 10:00",
      "motif": "Absent sans justification",
      "status": "absent",
      "statut": "pending"
    },
    ...
  ],
  "absencesBySubject": [
    {
      "subject": "Programmation Web",
      "totalAbsences": 3,
      "absencePercentage": 30,
      "eliminationStatus": "Risque"
    },
    ...
  ]
}
```

### 4. Récupérer les statistiques du département
```
GET /api/department-head/statistics
```

**Réponse:**
```json
{
  "totalStudents": 50,
  "eliminatedCount": 3,
  "atRiskCount": 8,
  "okCount": 39,
  "averageAbsenteeismRate": 22,
  "absencesByDate": [
    { "date": "2024-11-15", "count": "5" },
    ...
  ],
  "studentsBySpecialite": {
    "Informatique": 30,
    "Électrique": 20
  }
}
```

### 5. Exporter en CSV
```
GET /api/department-head/export-csv
```
Télécharge un fichier CSV avec tous les étudiants et leurs stats.

---

## 🖥️ Pages Implémentées

### 1. Dashboard Chef de Département
**Route:** `/department-head`

#### Fonctionnalités:
- 📊 Vue d'ensemble des étudiants du département
- 🔍 Filtres de recherche avancés
  - Recherche par nom/prénom
  - Filtrage par groupe
  - Filtrage par spécialité
  - Filtrage par statut (OK/Risque/Éliminé)
- 📋 Tableau complet avec colonnes:
  - Nom complet (avec email)
  - Spécialité
  - Groupe
  - Total absences
  - Seuil
  - % d'absentéisme
  - Badge de statut (couleur codée)
  - Bouton "Voir détails"
- 📥 Export CSV
- 📊 Cartes de résumé en bas de page

#### Badges de Statut:
| Statut | Couleur | Conditions |
|--------|--------|-----------|
| **OK** | 🟢 Vert | < 30% d'absences |
| **Risque** | 🟠 Orange | 30% - 50% d'absences |
| **Éliminé** | 🔴 Rouge | ≥ 50% d'absences |

---

### 2. Page Détails Étudiant
**Route:** `/department-head/student/:studentId`

#### Sections:

##### A. Informations Générales
- Nom complet
- Email
- Spécialité
- Groupe

##### B. État par Matière
Cartes individuelles pour chaque matière montrant:
- Nom de la matière
- Total absences
- % d'absentéisme
- Statut (OK/Risque/Éliminé)

##### C. Tableau d'Absences
| Colonne | Description |
|---------|-----------|
| Date | Date du cours |
| Matière | Nom de la matière |
| Horaire | Heure du cours |
| Motif | Raison de l'absence |
| Statut | absent/excused/present/late/left_early |
| État | pending/approved/rejected |

##### D. Statistiques Résumées
- Total absences
- % max d'absentéisme
- Nombre de matières

---

### 3. Page Statistiques du Département
**Route:** `/department-head/statistics`

#### Métriques Clés:
- 👥 Total d'étudiants
- ✅ Nombre d'étudiants OK
- ⚠️ Nombre en risque
- ❌ Nombre d'éliminés
- 📊 Taux moyen d'absentéisme

#### Graphiques:
1. **Répartition par Statut** (Pie Chart)
   - Distribution des étudiants OK/Risque/Éliminé

2. **Tendance des Absences** (Bar Chart)
   - Absences par jour (2 dernières semaines)

3. **Étudiants par Spécialité** (Bar Chart)
   - Distribution des étudiants par spécialité

#### Tableau Détaillé:
- Résumé général (nombre, pourcentage)
- Métriques d'absentéisme
- Distribution par spécialité

---

## 🔧 Service API Frontend

**Fichier:** `src/services/departmentHeadService.js`

```javascript
departmentHeadService.getDepartment()          // Récupérer le département
departmentHeadService.getStudents(filters)     // Récupérer les étudiants
departmentHeadService.getStudentDetails(id)    // Récupérer un étudiant
departmentHeadService.getStatistics()          // Récupérer les statistiques
departmentHeadService.exportCSV()              // Exporter en CSV
```

### Exemple d'utilisation:
```javascript
const students = await departmentHeadService.getStudents({
  search: 'Ahmed',
  specialite: 'Informatique',
  statut: 'Risque'
});
```

---

## 🎨 Styles et UI/UX

### Design System:
- **Couleurs:**
  - Primaire: #3b82f6 (Bleu)
  - Succès: #10b981 (Vert)
  - Avertissement: #f59e0b (Orange)
  - Danger: #ef4444 (Rouge)
  - Neutre: #6b7280 (Gris)

- **Typographie:**
  - Titres: 700 (Bold)
  - Contenu: 400-500 (Normal)
  - Petits textes: 12-13px

- **Espacement:** Système de grille 20px

### Composants réutilisables:
- Filtres (input, select)
- Cartes (stat, info, subject)
- Tableaux (responsive, hover effects)
- Badges de statut (color-coded)
- Boutons (action, export)

---

## 📊 Logique de Calcul des Absences

### Seuil (threshold):
```
threshold = ceil(nombre_de_cours * 0.3) // 30% par défaut
```

### Pourcentage d'absentéisme:
```
absencePercentage = (totalAbsences / totalCourses) * 100
```

### Statut d'élimination:
```
si absencePercentage >= 50:
  status = "Éliminé"
sinon si absencePercentage >= 30:
  status = "Risque"
sinon:
  status = "OK"
```

---

## 🔐 Authentification

- Toutes les routes requièrent une authentification JWT
- Le token est stocké dans les cookies ou localStorage
- Le middleware `verifyToken` valide chaque requête
- Seuls les chefs de département peuvent accéder à ces pages

---

## 📱 Responsive Design

### Breakpoints:
- **Desktop:** ≥ 1024px (3+ colonnes)
- **Tablette:** 768px - 1024px (2 colonnes)
- **Mobile:** < 768px (1 colonne)

### Optimisations mobiles:
- Tables scrollables horizontalement
- Grille responsive
- Navigation simplifiée
- Textes adaptés

---

## 🚀 Déploiement

### Vérifications avant déploiement:

1. **Backend:**
   - Routes d'authentification fonctionnelles
   - Modèles bien synchronisés avec la BD
   - CORS configuré correctement
   - Les middlewares de vérification en place

2. **Frontend:**
   - Service API configuré avec la bonne URL
   - Routes ajoutées dans App.jsx
   - Composants stylisés et responsifs
   - Gestion des erreurs en place

### Commandes:
```bash
# Backend
cd backend/auth-service
npm install
node server.js

# Frontend
cd frontend/learnflow
npm install
npm run dev
```

---

## 📝 Exemple de Workflow Utilisateur

1. **Chef se connecte** → Dashboard affiche ses étudiants
2. **Filtre par groupe/spécialité** → Liste mise à jour
3. **Clique sur "Voir détails"** → Affiche page détails étudiant
4. **Analyse absences par matière** → Identifie les problèmes
5. **Revient au dashboard** → Clique sur "Statistiques"
6. **Visualise graphiques** → Exporte rapport en CSV

---

## 🐛 Dépannage

### Problème: Les données ne se chargent pas
**Solution:**
- Vérifier que le token est valide
- Vérifier les logs du serveur backend
- Vérifier la URL de l'API

### Problème: Les filtres ne fonctionnent pas
**Solution:**
- Vérifier que les paramètres sont bien formés
- Vérifier la base de données pour les données
- Vérifier la console du navigateur pour les erreurs

### Problème: Les graphiques ne s'affichent pas
**Solution:**
- Vérifier les données retournées par l'API
- Vérifier la console du navigateur pour les erreurs Canvas
- S'assurer que les données sont au format correct

---

## 📚 Technologies Utilisées

- **Backend:** Node.js, Express, Sequelize, PostgreSQL
- **Frontend:** React, React Router, Axios
- **Graphiques:** HTML5 Canvas (API native)
- **Authentification:** JWT
- **Styles:** CSS3 (responsive)

---

## ✅ Checklist d'Implémentation

- ✅ Routes backend créées
- ✅ Service API frontend
- ✅ Page Dashboard
- ✅ Page Détails Étudiant
- ✅ Page Statistiques
- ✅ Filtres avancés
- ✅ Export CSV
- ✅ Graphiques
- ✅ Responsive design
- ✅ Authentification
- ✅ Gestion des erreurs

---

## 🎓 Informations pour l'Équipe de Développement

Pour continuer le développement:

1. **Export PDF:** Utiliser `html2pdf` ou `pdfkit`
2. **Notifications:** Ajouter un système d'alertes pour risques élevés
3. **Historique:** Tracker les changements de statut
4. **Rapports:** Générer des rapports mensuels/semestriels
5. **Analyses avancées:** Machine Learning pour prédire les éliminations

---

**Créé le:** 17 novembre 2024
**Version:** 1.0
**Statut:** ✅ Production Ready
