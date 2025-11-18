# Guide Rapide: Onglet Absences & Éliminations

## 🎯 Objectif
Permettre aux étudiants de consulter:
- ✅ Leur historique complet des absences
- ✅ L'état d'élimination par matière
- ✅ Les statuts de justification
- ✅ Les statistiques d'assiduité

## 🚀 Démarrage Rapide

### Pour les utilisateurs (Étudiants)

1. **Accédez à votre profil**
   - Cliquez sur votre avatar en haut à droite
   - Sélectionnez "Mon Profil"

2. **Navigez vers l'onglet "Mes Absences & Éliminations"**
   - Vous verrez 2 onglets: "Informations Personnelles" et "Mes Absences & Éliminations"
   - Cliquez sur le nouvel onglet

3. **Consultez vos données**
   - **Section 1: Statistiques** - Aperçu rapide de vos absences
   - **Section 2: Historique** - Tableau détaillé de chaque absence
   - **Section 3: État d'élimination** - Taux par matière avec indicateur

### Pour les administrateurs/développeurs

1. **Vérifier que les routes sont actives**
   ```bash
   # Auth Service (Port 4000)
   GET http://localhost:4000/api/auth/student/absences
   
   # Reference Service (Port 3000) - Route interne
   GET http://localhost:3000/api/student/absences/:studentId
   ```

2. **Démarrer les services**
   ```bash
   # Terminal 1: Auth Service
   cd backend/auth-service
   npm install
   node server.js
   
   # Terminal 2: Reference Service
   cd backend/Reference_documents
   npm install
   node server.js
   
   # Terminal 3: Frontend
   cd frontend/learnflow
   npm install
   npm run dev
   ```

## 📊 Interprétation des Données

### Statistiques affichées
| Métrique | Signification |
|----------|---------------|
| Absences Total | Nombre total de marques d'absence (tous types) |
| Non Justifiées | Absences sans excuse (absence_type = 'absent') |
| Justifiées | Absences avec motif accepté |
| Présences | Sessions où vous étiez présent |

### Tableau des Absences
| Colonne | Info |
|---------|------|
| Matière | Nom et code du cours |
| Type | Statut (Présent, Absent, Justifié, Retard, etc.) |
| Date | Quand la session a eu lieu |
| Enseignant | ID du professeur |
| Motif | Raison si justifiée |
| Statut | En attente/Approuvé/Rejeté |
| Notes | Remarques additionnelles |

### État d'Élimination

**Seuil d'élimination: 25% d'absences**

Exemple:
- Si vous avez 4 cours et 1 absence → 25% = ⚠️ ÉLIMINÉ
- Si vous avez 10 cours et 2 absences → 20% = ✅ ADMIS

```
État = "ÉLIMINÉ" si (absences / total_cours) × 100 ≥ 25%
```

## 🔴 Signification des Couleurs

### Types d'absence
| Couleur | Type | Signification |
|--------|------|--------------|
| 🟢 Vert | Présent | Vous étiez là |
| 🔴 Rouge | Absent | Absence non justifiée |
| 🟠 Orange | Justifié | Absence avec excuse |
| 🔵 Bleu | Retard | Arrivée tardive |
| 🟣 Violet | Départ anticipé | Vous avez quitté tôt |

### Statuts d'approbation
| Couleur | Statut | Signification |
|--------|--------|--------------|
| 🟠 Orange | En attente | En révision |
| 🟢 Vert | Approuvé | Validé par l'admin |
| 🔴 Rouge | Rejeté | Refusé |

## ❓ Questions Fréquentes

**Q: Comment puis-je contester une absence?**
A: Actuellement, utilisez le formulaire de contact. La fonctionnalité "Recours" sera bientôt disponible.

**Q: Quand ma justification est-elle approuvée?**
A: L'administrateur doit l'examiner. Vérifiez le statut dans le tableau (Approuvé/Rejeté).

**Q: Comment puis-je éviter l'élimination?**
A: Maintenez moins de 25% d'absences. Par exemple:
- 10 cours = maximum 2-3 absences acceptables
- 20 cours = maximum 4-5 absences acceptables

**Q: Où puis-je télécharger un certificat d'absences?**
A: Utilisez le bouton "Télécharger en PDF" (développement en cours).

## 🔐 Confidentialité & Sécurité

- ✅ Seuls les étudiants voient leurs propres données
- ✅ Les enseignants ne peuvent pas voir cet onglet
- ✅ Les données sont protégées par token JWT
- ✅ Authentification requise pour accès

## 📱 Compatibilité

- ✅ Desktop (PC/Mac)
- ✅ Tablette (iPad, Android)
- ✅ Mobile (responsive)
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)

## ⚡ Raccourcis Utiles

- **Actualiser les données:** Bouton "Actualiser" dans la section historique
- **Copier votre email:** Cliquez sur l'icône de copie
- **Voir les détails:** Survolez les cellules du tableau

## 🆘 Assistance

Si vous rencontrez des problèmes:
1. Actualiser la page (F5)
2. Vérifier votre connexion Internet
3. Vider le cache du navigateur (Ctrl+Shift+Delete)
4. Contacter l'administrateur

## 📝 Notes de développement

### Fichiers modifiés
- `frontend/learnflow/src/user/StudentAbsencesTab.jsx` ✨ NOUVEAU
- `frontend/learnflow/src/user/Profile.jsx` 🔄 MODIFIÉ
- `backend/auth-service/routes/authRoutes.js` 🔄 MODIFIÉ
- `backend/Reference_documents/routes/TeacherCalendar.js` 🔄 MODIFIÉ

### Routes API créées
- `GET /api/auth/student/absences` - Pour les étudiants
- `GET /api/student/absences/:studentId` - Service interne

### Modèles utilisés
- StudentAbsence
- Schedule
- Matiere
- User

## 📈 Prochaines Étapes

- [ ] Exporter en PDF
- [ ] Exporter en CSV
- [ ] Certificat d'absences à télécharger
- [ ] Système de recours automatisé
- [ ] Notifications pour élimination imminente
- [ ] Graphiques d'analyse d'assiduité
- [ ] Comparaison avec la moyenne de la classe
