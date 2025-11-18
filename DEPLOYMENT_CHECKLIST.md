# Checklist de Déploiement: Onglet Absences & Éliminations

## ✅ Phase 1: Préparation

- [ ] Avoir une copie de sauvegarde de la base de données
- [ ] Vérifier que tous les services tournent correctement
- [ ] Vérifier que git est à jour
- [ ] Créer une branche de déploiement: `git checkout -b feature/student-absences-tab`

## ✅ Phase 2: Vérification du Code

### Frontend
- [ ] `npm run lint` dans `frontend/learnflow` - 0 erreur
- [ ] `npm run build` dans `frontend/learnflow` - Build succès
- [ ] Pas d'avertissements dans la console (F12)
- [ ] Images et icônes chargent correctement

### Backend
- [ ] `npm run lint` dans `backend/auth-service` (si applicable)
- [ ] `npm run lint` dans `backend/Reference_documents` (si applicable)
- [ ] Vérifier les logs au démarrage - pas d'erreurs

### Base de données
- [ ] Table `student_absence` existe
- [ ] Table `schedule` existe  
- [ ] Table `matiere` existe
- [ ] Indexes créés sur `student_id` et `schedule_id`

## ✅ Phase 3: Tests Unitaires

### Tests Frontend
```bash
cd frontend/learnflow
npm run test
# [ ] Tous les tests passent
# [ ] Coverage > 80%
```

### Tests Backend
```bash
cd backend/auth-service
npm run test
# [ ] Tous les tests passent

cd backend/Reference_documents
npm run test
# [ ] Tous les tests passent
```

### Tests d'Intégration
- [ ] GET /api/auth/student/absences retourne 200
- [ ] GET /api/student/absences/:id retourne 200
- [ ] Format de réponse valide
- [ ] Pas d'erreurs CORS
- [ ] Authentification fonctionne

## ✅ Phase 4: Déploiement Code

### Étape 1: Commit et Push
```bash
cd learflow
git add .
git commit -m "feat: Add 'Student Absences & Eliminations' tab"
git push origin feature/student-absences-tab
```
- [ ] Commit effectué
- [ ] Push effectué
- [ ] Branch visible sur GitHub

### Étape 2: Pull Request
- [ ] PR créé avec description
- [ ] PR linked à l'issue (si existante)
- [ ] Reviewers assignés
- [ ] CI/CD passé (GitHub Actions)
- [ ] Conflicts résolus

### Étape 3: Merge
- [ ] PR approuvé par au moins 1 reviewer
- [ ] All checks passed
- [ ] Merge en main
- [ ] Branch supprimée

## ✅ Phase 5: Déploiement Production

### Préparation
- [ ] Tag version créé: `git tag v1.2.0`
- [ ] Release notes écrites
- [ ] Env variables vérifiées
- [ ] Secrets configurés (JWT_SECRET, DB_URL)

### Déploiement
- [ ] Frontend: `npm run build && npm start`
- [ ] Backend auth-service: `npm start`
- [ ] Backend reference-service: `npm start`
- [ ] Database migrations appliquées
- [ ] Cache invalidé (CDN, Redis)

### Vérification Post-Déploiement
- [ ] Accès au site: https://learnflow.com
- [ ] Login fonctionne (étudiant)
- [ ] Profil accessible
- [ ] Onglet "Absences" visible
- [ ] Données chargent correctement
- [ ] Pas d'erreurs 500
- [ ] Logs cleans (pas de warnings)

## ✅ Phase 6: Monitoring

### Métriques à surveiller
- [ ] Temps de réponse API < 500ms
- [ ] Taux d'erreur < 1%
- [ ] CPU usage < 70%
- [ ] Mémoire < 80%
- [ ] Uptime > 99.9%

### Health Checks
```bash
# Auth Service
curl http://localhost:4000/api/auth/profile -H "Cookie: token=..."

# Reference Service  
curl http://localhost:3000/api/student/absences/1 -H "Authorization: Bearer ..."

# Database
SELECT COUNT(*) FROM referentiels.student_absence;
```

- [ ] Auth Service répond correctement
- [ ] Reference Service répond correctement
- [ ] Database accessible
- [ ] Pas de timeouts

## ✅ Phase 7: Documentation

### Mise à jour documentation
- [ ] README.md mis à jour
- [ ] CHANGELOG.md updated
- [ ] API documentation: Swagger/Postman
- [ ] User guide: Release notes

### Fichiers créés
- [x] STUDENT_ABSENCES_TAB_IMPLEMENTATION.md
- [x] ABSENCES_TAB_QUICK_START.md
- [x] TEST_ABSENCES_TAB.md
- [x] ABSENCES_TAB_ARCHITECTURE.md
- [x] DEPLOYMENT_CHECKLIST.md (ce fichier)

## ✅ Phase 8: Support Utilisateur

### Communication
- [ ] Email aux utilisateurs (annonce)
- [ ] Updates section du site (What's new)
- [ ] Social media post
- [ ] Slack/Discord announcement

### Support
- [ ] Help documentation accessible
- [ ] FAQ updated
- [ ] Support email configuré
- [ ] Bug report system en place

## ✅ Phase 9: Rollback Plan

### En cas de problème critique
1. [ ] Identifier le problème dans les logs
2. [ ] Décider: Hotfix ou Rollback
3. Si Hotfix:
   - [ ] Créer branche: `git checkout -b hotfix/issue-name`
   - [ ] Corriger le bug
   - [ ] Tester localement
   - [ ] Déployer en prod
4. Si Rollback:
   - [ ] Reverter le commit: `git revert <commit-hash>`
   - [ ] Redéployer
   - [ ] Vérifier stabilité

### Procédure de Rollback
```bash
# Option 1: Revert le commit
git revert HEAD
git push origin main

# Option 2: Reset à version précédente
git reset --hard v1.1.0
git push origin main --force

# Option 3: Manual - arrêter et redémarrer vieux code
pm2 restart learnflow-backend-old
```

## ✅ Phase 10: Post-Déploiement

### Vérifications finales
- [ ] Aucun incident signalé
- [ ] Performance: requêtes < 500ms
- [ ] Utilisateurs satisfaits
- [ ] Taux d'utilisation du nouvel onglet
- [ ] Feedback collecté

### Optimisations
- [ ] Cache ajouté si nécessaire
- [ ] Indexes database optimisés
- [ ] CDN configuré pour assets
- [ ] Compression gzip activée

### Maintenance
- [ ] Monitoring actif 24/7
- [ ] Logs archivés
- [ ] Backups vérifiés
- [ ] Équipe informée

## 📊 Checklist des fichiers modifiés

| Fichier | Type | Statut |
|---------|------|--------|
| `frontend/learnflow/src/user/Profile.jsx` | Modifié | ✅ |
| `frontend/learnflow/src/user/StudentAbsencesTab.jsx` | Nouveau | ✅ |
| `backend/auth-service/routes/authRoutes.js` | Modifié | ✅ |
| `backend/Reference_documents/routes/TeacherCalendar.js` | Modifié | ✅ |

## 🔍 Checklist de Vérification Finale

### Fonctionnalité
- [ ] Onglet visible pour étudiants
- [ ] Onglet caché pour enseignants/admins
- [ ] Données se chargent correctement
- [ ] Statistiques exactes
- [ ] Tableau pagené correctement
- [ ] Calcul élimination > 25% = ✓ ÉLIMINÉ
- [ ] Bouton actualiser fonctionne
- [ ] Pas d'erreur dans console

### Performance
- [ ] Chargement < 3 secondes
- [ ] Scroll fluide
- [ ] Pas de memory leak
- [ ] Pas de lag au clic

### Sécurité
- [ ] Token vérifié
- [ ] Données personnelles protégées
- [ ] SQL injection impossible
- [ ] XSS protection active

### UX/UI
- [ ] Design cohérent avec site
- [ ] Responsive sur mobile
- [ ] Accessibilité OK (a11y)
- [ ] Messages clairs

### Documentation
- [ ] Code commenté
- [ ] README complet
- [ ] Architecture expliquée
- [ ] Tests documentés

## 📝 Notes de déploiement

**Date de déploiement:** _______________
**Déployé par:** _______________
**Version:** v1.2.0
**Environnement:** Production
**Durée d'arrêt estimée:** 0 min (hot deployment)

## 🎉 Acceptation

- [ ] Déploiement approuvé par: _______________
- [ ] Product Owner sign-off: _______________
- [ ] Tests passés par: _______________
- [ ] Go-live date: _______________

---

## Escalade en cas de problème

**Problème:** _______________

**Niveau 1 (Devops/Tech Lead):**
- [ ] Identifier le problème
- [ ] Vérifier les logs
- [ ] Essayer un redémarrage

**Niveau 2 (Backend Developer):**
- [ ] Analyser le code
- [ ] Vérifier base de données
- [ ] Créer un hotfix

**Niveau 3 (Full Team):**
- [ ] Décider d'un rollback
- [ ] Exécuter le rollback
- [ ] Communiquer aux utilisateurs

---

**Déploiement terminé avec succès:** ✓ / ✗

Date/Heure: _______________
