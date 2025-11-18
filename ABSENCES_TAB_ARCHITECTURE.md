# Architecture: Onglet Absences & Éliminations

## 🏗️ Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vue)                           │
│              http://localhost:5173                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Profile.jsx                                                    │
│  ├─ Header Card (Nom, Avatar, Role)                            │
│  ├─ Tabs                                                        │
│  │  ├─ Tab 1: Informations Personnelles                        │
│  │  │   ├─ Infos personnelles (Card)                           │
│  │  │   ├─ Localisation & Académique (Card)                    │
│  │  │   └─ Informations Professionnelles (Card)                │
│  │  │                                                          │
│  │  └─ Tab 2: Mes Absences & Éliminations [NOUVEAU]            │
│  │      └─ StudentAbsencesTab.jsx                              │
│  │          ├─ Statistiques (4 cartes)                         │
│  │          ├─ Historique des absences (Table)                 │
│  │          ├─ État d'élimination (Table)                      │
│  │          └─ Actions (Export)                                │
│  │                                                              │
│  └─ Modal de modification du profil                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP)
┌─────────────────────────────────────────────────────────────────┐
│                  AUTH SERVICE (Port 4000)                       │
│              backend/auth-service/server.js                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Route: GET /api/auth/student/absences [NOUVELLE]              │
│  ├─ Authentification JWT                                       │
│  ├─ Récupération de student_id depuis token                    │
│  └─ Proxy vers Reference Service (3000)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP)
┌─────────────────────────────────────────────────────────────────┐
│             REFERENCE SERVICE (Port 3000)                       │
│    backend/Reference_documents/routes/TeacherCalendar.js        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Route: GET /api/student/absences/:studentId [NOUVELLE]        │
│  ├─ Récupération StudentAbsence WHERE student_id               │
│  ├─ Include: Schedule (JOIN)                                   │
│  │   └─ Include: Matiere                                       │
│  └─ Format et retour JSON                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (SQL)
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│                Schema: referentiels                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ student_absence  │    │    schedule      │                  │
│  ├──────────────────┤    ├──────────────────┤                  │
│  │ id               │───→│ id               │                  │
│  │ student_id       │    │ enseignant_id    │                  │
│  │ schedule_id      │───→│ date_debut       │                  │
│  │ absence_type     │    │ date_fin         │                  │
│  │ motif            │    │ matiere_id       │───┐              │
│  │ marked_at        │    │ salle_id         │   │              │
│  │ statut           │    │ classe_id        │   │              │
│  │ notes            │    └──────────────────┘   │              │
│  └──────────────────┘                           │              │
│                             ┌──────────────────┐│              │
│                             │    matiere       ││              │
│                             ├──────────────────┤│              │
│                             │ id              │←┘              │
│                             │ name            │                │
│                             │ code            │                │
│                             └──────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Flux de données

### 1. Chargement initial du profil

```
Frontend (Profile.jsx)
  ↓ GET /api/auth/profile (token cookie)
Auth Service (authRoutes.js)
  ↓ JWT Verify + findByPk(decoded.id)
Database (users table)
  ↓ User data
Auth Service
  ↓ {user: {...}}
Frontend
  ↓ setProfile(data.user)
  ↓ Affichage Header + Tabs
```

### 2. Clic sur onglet "Mes Absences & Éliminations"

```
Frontend (StudentAbsencesTab.jsx mounted)
  ↓ useEffect
  ↓ fetchStudentAbsences()
  ↓ GET /api/auth/student/absences (token cookie)
Auth Service (authRoutes.js line ~)
  ↓ JWT Verify + getStudentIdFromToken()
  ↓ Proxy forward to Reference Service
Reference Service (TeacherCalendar.js)
  ↓ GET /api/student/absences/:studentId
  ↓ StudentAbsence.findAll({
       where: {student_id},
       include: [Schedule.include(Matiere)]
     })
Database
  ↓ [StudentAbsence records with joins]
Reference Service
  ↓ {id, absence_type, schedule: {matiere: {...}}}
Auth Service
  ↓ Pass through response
Frontend
  ↓ setAbsences(data)
  ↓ calculateStatistics()
  ↓ calculateEliminations()
  ↓ Affichage Tables + Statistiques
```

## 🔄 Cycle de vie du composant

```
Mount
  ↓
useEffect triggered
  ↓
setLoading(true)
  ↓
fetch /api/auth/student/absences
  ↓
  ├─ Success
  │  ├─ setAbsences(data)
  │  ├─ calculateStatistics()
  │  ├─ calculateEliminations()
  │  └─ message.success()
  │
  └─ Error
     ├─ setAbsences([])
     ├─ message.error()
     └─ console.error()
  ↓
setLoading(false)
  ↓
Render with data
```

## 🗂️ Structure des fichiers modifiés

```
learnflow/
├── frontend/
│   └── learnflow/
│       └── src/
│           ├── user/
│           │   ├── Profile.jsx [MODIFIÉ]
│           │   │   ├─ Import StudentAbsencesTab
│           │   │   ├─ Import Tabs, ExclamationCircleOutlined
│           │   │   ├─ tabItems array with 2 tabs
│           │   │   └─ Tab 2 conditionally for role='etudiant'
│           │   │
│           │   └── StudentAbsencesTab.jsx [NOUVEAU]
│           │       ├─ fetchStudentAbsences()
│           │       ├─ calculateStatistics()
│           │       ├─ calculateEliminations()
│           │       ├─ getStatusTag()
│           │       ├─ getApprovalStatus()
│           │       ├─ formatDate()
│           │       ├─ Render: Statistics Cards
│           │       ├─ Render: Absence History Table
│           │       ├─ Render: Elimination Status Table
│           │       └─ Render: Export Actions
│           │
│           └── styles/
│               └── (CSS global déjà présent)
│
└── backend/
    ├── auth-service/
    │   └── routes/
    │       └── authRoutes.js [MODIFIÉ]
    │           ├─ Route: GET /api/auth/student/absences [NOUVELLE]
    │           ├─ Extraction du token (cookie/header)
    │           ├─ JWT verify
    │           ├─ Proxy to Reference Service
    │           └─ Error handling
    │
    └── Reference_documents/
        └── routes/
            └── TeacherCalendar.js [MODIFIÉ]
                └─ Route: GET /api/student/absences/:studentId [NOUVELLE]
                   ├─ Get models from app
                   ├─ StudentAbsence.findAll()
                   ├─ Include: Schedule > Matiere
                   ├─ Format response
                   └─ Error handling
```

## 🔐 Sécurité et Authentification

```
Frontend
  ↓
Cookie token included (credentials: 'include')
  ↓
Auth Service
  ├─ Extract token from cookie/header
  ├─ jwt.verify(token, secretKey)
  ├─ Return decoded.id (student_id)
  └─ Check if valid
    ↓ ✓ Valid
    │  └─ Forward with Authorization header
    │
    └─ ✗ Invalid
       └─ Return 401 Unauthorized

Reference Service
  ├─ Extract token from Authorization header
  ├─ Verify authenticity (optional, trusted from auth-service)
  ├─ Query StudentAbsence WHERE student_id = studentId
  └─ Return only user's data (no cross-student access)
```

## 📈 Flux d'Élimination

```
Raw Data from Database
  │
  ├─ [StudentAbsence 1: absent]
  ├─ [StudentAbsence 2: present]
  ├─ [StudentAbsence 3: excused]
  ├─ [StudentAbsence 4: late]
  └─ [StudentAbsence 5: absent]
  │
  ↓ calculateEliminations()
  │
  ├─ Group by matiere
  │  └─ {
  │      "Mathématiques": [
  │        {absence_type: 'absent'},
  │        {absence_type: 'present'},
  │        {absence_type: 'absent'}
  │      ]
  │    }
  │
  ├─ Count totals & absences
  │  └─ {
  │      "Mathématiques": {
  │        total: 3,
  │        absences: 2,
  │        rate: 66.67%
  │      }
  │    }
  │
  └─ Calculate elimination status
     └─ if (rate >= 25%) isEliminated = true
        
     Result:
     {
       "Mathématiques": {
         total: 3,
         absences: 2,
         rate: 66.67,
         isEliminated: true  ← ⚠️ ÉLIMINÉ
       }
     }
  │
  ↓
Display in Table with Progress Bar
  └─ 66% → 🔴 Red Progress Bar → "ÉLIMINÉ (25%+)"
```

## 🚀 Performance

### Optimisations appliquées

1. **Lazy Loading**
   - StudentAbsencesTab chargé uniquement si onglet cliqué
   - useEffect déclenché au premier rendu

2. **Requêtes optimisées**
   - Include au lieu de N+1 queries
   - WHERE student_id (index sur la colonne)
   - ORDER BY marked_at DESC (récent d'abord)

3. **Calculs efficients**
   - Statistiques: O(n) single pass
   - Éliminations: O(n log n) avec grouping
   - Pas de re-calculation inutile

4. **Rendu optimisé**
   - Ant Design Table avec pagination (10/page)
   - Virtualization possible pour 1000+ lignes
   - Memoization via keys dans map()

### Temps de réponse cible

| Opération | Cible | Budget |
|-----------|-------|--------|
| GET absences | < 500ms | 1000ms |
| Calculate stats | < 50ms | 100ms |
| Render component | < 200ms | 500ms |
| Total page load | < 2s | 5s |

## 🔄 Intégrations avec systèmes existants

### StudentAbsence Model
```javascript
// Existant
StudentAbsence.findAll({
  where: { schedule_id, student_id },
  include: [Schedule, Matiere]
})

// Utilisé par
- StudentAbsencesTab.jsx
- Reference Service route
```

### Schedule Model
```javascript
// Relation: StudentAbsence.schedule_id → Schedule.id
Schedule.findAll({
  where: { id: scheduleId },
  include: [Matiere]
})
```

### Matiere Model
```javascript
// Relation: Schedule.matiere_id → Matiere.id
// Utilisé pour afficher nom et code de la matière
```

## 🔌 Points d'extension

Pour ajouter de nouvelles fonctionnalités:

### Export PDF
```javascript
// StudentAbsencesTab.jsx line ~200
const exportPDF = () => {
  // Utiliser jsPDF + html2canvas
}
```

### Export CSV
```javascript
// StudentAbsencesTab.jsx line ~210
const exportCSV = () => {
  // Convertir dataSource en CSV
}
```

### Recours d'absence
```javascript
// POST /api/student/absences/:absenceId/appeal
// POST /api/auth/student/absences/:absenceId/appeal
```

### Notifications
```javascript
// Ajouter dans calculateEliminations()
if (isEliminated) {
  notifyStudent("Vous êtes éliminé en " + matiereName)
}
```

## ⚡ Technologies utilisées

| Technologie | Version | Utilisation |
|------------|---------|------------|
| React | 18+ | Frontend framework |
| Ant Design | 5.x | UI components (Table, Tabs, Card, etc) |
| axios/fetch | Native | HTTP requests |
| Sequelize | 6.x | ORM Database |
| Express.js | 4.x | Backend server |
| PostgreSQL | 12+ | Database |
| JWT | jsonwebtoken | Authentication |

## 📝 Notes importantes

1. **Secrets:**
   - `secretKey = 'alex'` doit être externalisé en production
   - Utiliser process.env pour la sécurité

2. **Erreurs réseau:**
   - Fallback à [] (empty array) si Reference Service down
   - Permet UX dégradée au lieu de crash

3. **Formatage de date:**
   - toLocaleDateString('fr-FR') pour format français
   - Includeftime pour les sessions

4. **Élimination:**
   - Seuil fixe: 25% (configurable en futur)
   - Basé sur absence_type = 'absent' uniquement
   - Les excused ne comptent pas
