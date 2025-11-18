# 🏗️ Diagrammes Architecturaux - Chef de Département

## 1️⃣ Architecture Globale du Système

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEARNFLOW PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CHEF DE DÉPARTEMENT                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Frontend (React)              Backend (Node.js)          │   │
│  │  ─────────────────              ─────────────────         │   │
│  │  • Dashboard                    • Auth Routes             │   │
│  │  • Détails Étudiant            • Department Head Routes  │   │
│  │  • Statistiques                • Models (Sequelize)      │   │
│  │  • Filtres & Export            • JWT Middleware          │   │
│  │                                                            │   │
│  │           ↕ HTTP / REST API ↕                             │   │
│  │           (Port 4000 / 5173)                             │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         PostgreSQL Database (Schemas)                     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  • auth.utilisateur                                      │   │
│  │  • referentiels.student                                  │   │
│  │  • referentiels.student_absence                          │   │
│  │  • referentiels.classe                                   │   │
│  │  • referentiels.departement                              │   │
│  │  • referentiels.specialite                               │   │
│  │  • referentiels.niveau                                   │   │
│  │  • referentiels.schedule                                 │   │
│  │  • referentiels.matiere                                  │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Flow de Données (Data Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                   UTILISATEUR (Chef)                         │
│                  Accès Dashboard                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────┐
        │  Frontend - React Component     │
        │  DepartmentHeadDashboard.jsx   │
        │  • État: students, loading     │
        │  • Filtres appliqués           │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Service API (Axios)            │
        │  departmentHeadService.js       │
        │  getStudents(filters)          │
        └─────────────┬──────────────────┘
                      │
        ┌─────────────┴────────────┐
        │  HTTP GET Request        │
        │  /api/department-head/   │
        │  students?groupe=A1&...  │
        └─────────────┬────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Backend - Express Route        │
        │  departmentHeadRoutes.js        │
        │  router.get("/students")       │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Middleware (Verify Token)      │
        │  • JWT validation              │
        │  • User check                  │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Query Building                 │
        │  • Find department classes      │
        │  • Apply filters               │
        │  • Join with Niveau/Specialite │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Database Queries (Sequelize)  │
        │  Classe.findAll()              │
        │  User.findAll()                │
        │  StudentAbsence.count()        │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  PostgreSQL Database           │
        │  • Fetch data from tables      │
        │  • Join operations             │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Build Response                 │
        │  • Calculate stats              │
        │  • Format data                  │
        │  • JSON response                │
        └─────────────┬──────────────────┘
                      │
        ┌─────────────┴────────────┐
        │  HTTP Response (JSON)    │
        │  [{student1}, ...]       │
        └─────────────┬────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Frontend - Update State        │
        │  setStudents(data)             │
        └─────────────┬──────────────────┘
                      │
                      ↓
        ┌────────────────────────────────┐
        │  Re-render Component            │
        │  Display updated table          │
        └─────────────┬──────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   UTILISATEUR Voit            │
│                  Dashboard Mise à Jour       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ Structure des Composants Frontend

```
┌──────────────────────────────────────────────────────┐
│            App.jsx (Routes)                           │
├──────────────────────────────────────────────────────┤
│                                                        │
│  Route: /department-head                             │
│  Component: DepartmentHeadDashboard.jsx             │
│  ├─ Filtres (groupe, spécialité, statut, recherche)│
│  ├─ Tableau d'étudiants                            │
│  ├─ Badges de statut (OK/Risque/Éliminé)           │
│  ├─ Boutons "Voir détails"                         │
│  ├─ Export CSV                                      │
│  └─ Cartes de résumé                               │
│                                                        │
│  ─────────────────────────────────────────────────   │
│                                                        │
│  Route: /department-head/student/:studentId         │
│  Component: StudentDetailPage.jsx                   │
│  ├─ Informations générales                         │
│  ├─ Cartes par matière                             │
│  ├─ Tableau d'absences                             │
│  └─ Statistiques résumées                          │
│                                                        │
│  ─────────────────────────────────────────────────   │
│                                                        │
│  Route: /department-head/statistics                 │
│  Component: DepartmentStatistics.jsx                │
│  ├─ Métriques clés (5)                             │
│  ├─ Graphique Pie (répartition)                    │
│  ├─ Graphique Bar (tendance)                       │
│  ├─ Graphique Bar (spécialités)                    │
│  └─ Tableau détaillé                               │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 4️⃣ Structure des Données - Modèle Entité-Relation

```
┌──────────────────────┐
│   DEPARTEMENT        │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ code                 │
│ chef_departement_id  │──┐
│ email                │  │
│ budget               │  │
│ statut               │  │
└──────────────────────┘  │
                          │ (1:1)
                          │ références
                   ┌──────▼──────────┐
                   │ UTILISATEUR      │
                   │ (auth schema)    │
                   ├──────────────────┤
                   │ id (PK)          │
                   │ nom              │
                   │ prenom           │
                   │ email            │
                   │ role             │
                   │ mdp_hash         │
                   │ classe_id        │
                   └──────┬───────────┘
                          │ (1:N)
                          │ enseigne
                          ↓
┌──────────────────────┐   ┌──────────────────────┐
│    SPECIALITE        │───│     NIVEAU           │
├──────────────────────┤   ├──────────────────────┤
│ id (PK)              │   │ id (PK)              │
│ name                 │   │ nom                  │
│ code                 │   │ specialite_id (FK)   │
│ departement_id (FK)◄─┼───┤ description          │
│ description          │   └──────┬───────────────┘
└──────────────────────┘          │ (1:N)
                                  │
                          ┌───────▼────────────┐
                          │    CLASSE          │
                          ├────────────────────┤
                          │ id (PK)            │
                          │ nom                │
                          │ niveau_id (FK)     │
                          │ effectif           │
                          │ annee_scolaire     │
                          └────────┬───────────┘
                                   │ (1:N)
                                   │
                    ┌──────────────┴────────────────┐
                    │                               │
                    ↓                               ↓
          ┌──────────────────┐        ┌──────────────────────┐
          │    STUDENT       │        │     SCHEDULE         │
          ├──────────────────┤        ├──────────────────────┤
          │ id (PK)          │        │ id (PK)              │
          │ nom              │        │ classe_id (FK)       │
          │ prenom           │        │ matiere_id (FK)      │
          │ email            │        │ date                 │
          │ numero_etudiant  │        │ start_time           │
          │ classe_id (FK)   │        │ end_time             │
          │ niveau_id (FK)   │        │ enseignant_id (FK)   │
          │ statut           │        │ salle_id (FK)        │
          └─────────┬────────┘        └──────┬───────────────┘
                    │ (1:N)                  │ (1:N)
                    │                        │
                    └────────────┬───────────┘
                                 │
                          ┌──────▼─────────────────┐
                          │  STUDENT_ABSENCE       │
                          ├────────────────────────┤
                          │ id (PK)                │
                          │ schedule_id (FK)       │
                          │ student_id (FK)        │
                          │ enseignant_id (FK)     │
                          │ absence_type           │
                          │ motif                  │
                          │ marked_at              │
                          │ statut                 │
                          └────────────────────────┘
```

---

## 5️⃣ Processus de Filtrage

```
                    ┌─────────────────────┐
                    │   Utilisateur       │
                    │  Applique Filtres   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼────┐  ┌──────▼──────┐ ┌────▼──────┐
        │  Recherche │  │   Groupe    │ │ Spécialité│
        │  (nom)     │  │             │ │           │
        └───────┬────┘  └──────┬──────┘ └────┬──────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                        ┌──────▼──────┐
                        │Combiner les │
                        │  critères   │
                        └──────┬──────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ↓                      ↓                      ↓
   ┌─────────┐        ┌──────────────┐        ┌──────────┐
   │ WHERE   │        │ INCLUDE      │        │ Calculer │
   │ classe  │   +    │ Relationships│   +    │ stats    │
   │ id IN   │        │ (niveau,     │        │          │
   │ (...)   │        │ specialite)  │        │          │
   └─────────┘        └──────────────┘        └──────────┘
        │                   │                      │
        └───────────────────┼──────────────────────┘
                            │
                     ┌──────▼──────┐
                     │   Résultat  │
                     │  Filtré     │
                     └─────────────┘
```

---

## 6️⃣ Calcul du Statut d'Élimination

```
                    ┌───────────────────────┐
                    │  Pour Chaque Étudiant │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Compter les absences   │
                    │ (absent + excused)     │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Compter les cours      │
                    │ (Schedule count)       │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Calculer pourcentage   │
                    │ (absences/cours)*100   │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ↓                       ↓                       ↓
   ┌─────────────┐         ┌──────────┐        ┌─────────────┐
   │ < 30%       │         │ 30-50%   │        │ >= 50%      │
   │             │         │          │        │             │
   │    Status   │         │  Status  │        │   Status    │
   │    "OK"     │         │ "Risque" │        │ "Éliminé"   │
   │             │         │          │        │             │
   │   Color     │         │  Color   │        │   Color     │
   │   GREEN     │         │ ORANGE   │        │   RED       │
   └─────────────┘         └──────────┘        └─────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                        ┌───────▼────────┐
                        │ Retourner      │
                        │ Student avec   │
                        │ Status + Infos │
                        └────────────────┘
```

---

## 7️⃣ États des Composants

```
DepartmentHeadDashboard.jsx
├── State Variables
│   ├── students: []                    (liste des étudiants)
│   ├── loading: boolean                (chargement)
│   ├── error: null | string            (erreur)
│   ├── searchTerm: ""                  (recherche)
│   ├── filterGroupes: ""               (groupe filter)
│   ├── filterSpecialites: ""           (spécialité filter)
│   ├── filterStatut: ""                (statut filter)
│   ├── groupes: []                     (liste unique)
│   └── specialites: []                 (liste unique)
│
└── Effects
    ├── useEffect([], [])               (initial load)
    ├── useEffect(..., filtres)         (on filter change)
    └── handlers (onClick, onChange)


StudentDetailPage.jsx
├── State Variables
│   ├── studentData: null               (données complètes)
│   ├── loading: boolean
│   ├── error: null | string
│   ├── studentId (from useParams)
│   │
│   └── Derived Data
│       ├── student: {...}
│       ├── absences: [...]
│       └── absencesBySubject: [...]
│
└── Effects
    ├── useEffect([studentId], [])      (load details)
    └── handlers (onClick)


DepartmentStatistics.jsx
├── State Variables
│   ├── stats: null                     (données stats)
│   ├── loading: boolean
│   └── error: null | string
│
└── Effects
    ├── useEffect([], [])               (load stats)
    └── Derived Data
        ├── statusData: [...]           (pour pie chart)
        ├── absenceTrendData: [...]     (pour bar chart)
        └── specialityData: [...]       (pour bar chart)
```

---

## 8️⃣ Cycle de Vie d'une Requête

```
TIME
│
│  Component Mounts
│  ├── setLoading(true)
│  ├── Call API (departmentHeadService)
│  │
│  │  Network Request
│  │  ├── HTTP GET
│  │  ├── Headers + JWT Token
│  │  └── Parameters (filters)
│  │
│  │  Backend Processing
│  │  ├── Verify Token
│  │  ├── Build Query
│  │  ├── Database Query
│  │  └── Calculate Stats
│  │
│  │  Response Received
│  │  ├── Parse JSON
│  │  ├── setLoading(false)
│  │  ├── setStudents(data)
│  │  │
│  ├─ Component Re-renders
│  ├─ Display Table
│  ├─ Show Data
│  │
│  └── User Interaction
│      └── (Filter/Click/Export)
│
└─────────────────────────────────────────→
```

---

## 9️⃣ Sécurité - Authentification Flow

```
┌─────────────────────────────────────────────┐
│         UTILISATEUR (Chef Dept)             │
│         Clique sur Dashboard                │
└────────────────┬────────────────────────────┘
                 │
                 ↓
        ┌────────────────────┐
        │ Frontend Check     │
        │ Token en local?    │
        └────────┬───────────┘
                 │
         ┌───────┴───────┐
         │               │
      OUI│               │NON
         │               │
         ↓               ↓
    ┌─────────┐   ┌──────────────┐
    │ Continue│   │ Redirect to  │
    │  Load   │   │ /auth (login)│
    └────┬────┘   └──────────────┘
         │
         ↓
   ┌──────────────────┐
   │ Call API Endpoint│
   │ + Include JWT    │
   │ in Headers       │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────────┐
   │ Backend Receives     │
   │ Request + JWT Token  │
   └────────┬─────────────┘
            │
            ↓
   ┌──────────────────────┐
   │ Middleware Check     │
   │ verifyToken()        │
   └────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
 VALID              INVALID
    │                │
    ↓                ↓
 ┌──────┐      ┌──────────┐
 │Continue│    │ Return   │
 │Process │    │ 401 Error│
 │ Request│    └──────────┘
 └────────┘
```

---

## 🔟 Architecture CSS (Responsive)

```
Desktop (≥ 1024px)
├── 3+ Colonnes grille
├── Tableaux complets
├── Tous les éléments visibles
└── Écran large optimal

        ↓ Media Query

Tablet (768px - 1024px)
├── 2 Colonnes grille
├── Tableaux adaptés
├── Éléments condensés
└── Écran moyen optimisé

        ↓ Media Query

Mobile (< 768px)
├── 1 Colonne grille
├── Tableaux scrollables
├── Éléments empilés
└── Écran petit optimisé
```

---

## 📊 Flux de Graphiques

```
Statistics Component Mounts
    ↓
Call departmentHeadService.getStatistics()
    ↓
Receive Data (metrics + dates)
    ↓
┌─────────────────────────────────────────┐
│ Prepare Data for Charts                 │
├─────────────────────────────────────────┤
│ Chart 1: Pie Chart (Status Distribution)│
│ data: [okCount, riskCount, eliminated]  │
│ labels: ["OK", "Risque", "Éliminé"]     │
├─────────────────────────────────────────┤
│ Chart 2: Bar Chart (Absence Trend)      │
│ data: [5, 8, 12, ...]                   │
│ labels: ["Nov 15", "Nov 16", ...]       │
├─────────────────────────────────────────┤
│ Chart 3: Bar Chart (Specialties)        │
│ data: [30, 20, ...]                     │
│ labels: ["Informatique", "Électrique"]  │
└─────────────────────────────────────────┘
    ↓
Create Canvas Elements
    ↓
Draw Charts (Canvas API)
    ↓
Display to User
```

---

**Créé le:** 17 novembre 2024
**Version:** 1.0
**Status:** ✅ Complete
