# Implémentation: Onglet "Mes Absences & Éliminations" dans le Profil Étudiant

## Vue d'ensemble
J'ai ajouté un nouvel onglet au profil étudiant qui affiche l'historique complet des absences et l'état d'élimination par matière.

## Modifications effectuées

### 1. Frontend

#### Fichier: `frontend/learnflow/src/user/StudentAbsencesTab.jsx` (NOUVEAU)
- Composant React dédié pour afficher les absences et éliminations
- **Fonctionnalités:**
  - Statistiques d'absences (total, non justifiées, justifiées, présences, retards)
  - Tableau complet des absences avec filtrage
  - Calculateur automatique du taux d'élimination (25%+ = éliminé)
  - Tableau d'état d'élimination par matière
  - Indicateurs visuels (couleurs, icônes, progress bars)
  - Bouton de rechargement des données
  - Actions d'export (PDF/CSV - placeholders pour développement futur)

#### Fichier: `frontend/learnflow/src/user/Profile.jsx` (MODIFIÉ)
- Intégration du composant `StudentAbsencesTab` via système de Tabs
- Nouvel onglet "Mes Absences & Éliminations" visible uniquement pour les étudiants
- Structure avec 2 onglets:
  1. Informations Personnelles (existant)
  2. Mes Absences & Éliminations (nouveau)

### 2. Backend

#### Fichier: `backend/auth-service/routes/authRoutes.js` (MODIFIÉ)
- **Nouvelle route:** `GET /api/auth/student/absences`
- Récupère les absences de l'étudiant authentifié
- Proxifie la requête vers le service Reference_documents (port 3000)
- Gestion sécurisée de l'authentification via token

#### Fichier: `backend/Reference_documents/routes/TeacherCalendar.js` (MODIFIÉ)
- **Nouvelle route:** `GET /api/student/absences/:studentId`
- Récupère toutes les absences d'un étudiant spécifique
- Jointure avec les modèles Schedule et Matiere pour données enrichies
- Format de réponse détaillé avec informations matière et enseignant

## Structure des données

### Réponse API `/api/auth/student/absences`
```json
[
  {
    "id": "uuid",
    "schedule_id": 1,
    "student_id": 1,
    "enseignant_id": 1,
    "absence_type": "absent|present|excused|late|left_early",
    "motif": "Raison de l'absence (si justifiée)",
    "marked_at": "2024-11-17T10:00:00Z",
    "notes": "Notes additionnelles",
    "statut": "pending|approved|rejected",
    "schedule": {
      "id": 1,
      "date_debut": "2024-11-17T10:00:00Z",
      "date_fin": "2024-11-17T11:00:00Z",
      "enseignant_id": 1,
      "matiere": {
        "id": 1,
        "name": "Mathématiques",
        "code": "MATH101"
      }
    }
  }
]
```

## Logique du calcul d'élimination

```
Seuil d'élimination: 25% d'absences non justifiées

Pour chaque matière:
- Nombre total de cours = count(all attendances for subject)
- Nombre d'absences = count(absence_type = 'absent')
- Taux d'absence = (absences / total) * 100
- État = "ÉLIMINÉ" si taux >= 25%, sinon "ADMIS"
```

## Composants Ant Design utilisés

- **Card**: Conteneurs des sections
- **Table**: Affichage des données d'absences et éliminations
- **Tabs**: Navigation entre les onglets
- **Tag**: Étiquetage des statuts
- **Statistic**: Affichage des statistiques
- **Progress**: Visualisation du taux d'élimination
- **Empty**: État vide
- **Tooltip**: Infobulle au survol
- **Button**: Actions (rechargement, export)
- **Space**: Espacement des éléments

## Icônes utilisées

- `ExclamationCircleOutlined`: Éliminations
- `ClockCircleOutlined`: Retards/attente
- `CheckCircleOutlined`: Approuvé/Admis
- `FileTextOutlined`: Justifications
- `ReloadOutlined`: Rechargement
- `DownloadOutlined`: Export

## Intégration avec le profil

- **Visible pour**: Rôle 'etudiant' uniquement
- **Emplacement**: Onglet 2 du profil après "Informations Personnelles"
- **Accès**: Depuis le profil utilisateur via `/profile`

## Points d'entrée API

### Pour les étudiants
```
GET http://localhost:4000/api/auth/student/absences
Headers: Cookie avec token ou Authorization: Bearer <token>
```

### Service interne (Reference_documents)
```
GET http://localhost:3000/api/student/absences/:studentId
```

## Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Vérification du token
- ✅ Accès restreint aux propres données
- ✅ Validation des IDs

## États de statut affichés

### Type d'absence
- 🟢 Présent (vert)
- 🔴 Absent (rouge)
- 🟠 Justifié (orange)
- 🔵 Retard (bleu)
- 🟣 Départ anticipé (violet)

### Statut d'approbation
- 🟠 En attente (orange)
- 🟢 Approuvé (vert)
- 🔴 Rejeté (rouge)

## Fonctionnalités futures (placeholders)

- Export en PDF
- Export en CSV
- Certificat d'absences
- Recours contre une élimination
- Génération de rapport

## Installation

Aucune dépendance supplémentaire requise. Les composants utilisent les packages existants (Ant Design).

## Tests recommandés

1. Vérifier que l'onglet n'apparaît que pour les étudiants
2. Charger les absences d'un étudiant avec données
3. Vérifier le calcul du taux d'élimination (25%)
4. Tester le rechargement des données
5. Vérifier l'affichage des statuts d'approbation
6. Tester la réactivité du tableau
7. Vérifier les messages de chargement/erreur
