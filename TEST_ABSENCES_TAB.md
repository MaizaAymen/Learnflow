# Plan de Test: Onglet Absences & Éliminations

## 📋 Objectif
Valider que le nouvel onglet "Mes Absences & Éliminations" fonctionne correctement dans le profil étudiant.

## ✅ Checklist Pre-test

Avant de démarrer les tests, assurez-vous que:
- [ ] Node.js est installé (v14+)
- [ ] Les dépendances sont installées (`npm install`)
- [ ] La base de données est synchronisée
- [ ] Les services sont démarrés (Port 4000, 3000, 5173)
- [ ] Vous avez des données d'absences dans la base de données

## 🚀 Procédure de Démarrage

### 1. Démarrer les services

```bash
# Terminal 1: Auth Service
cd backend/auth-service
node server.js
# ✓ Doit afficher: "✅ Auth service running on port 4000"

# Terminal 2: Reference Service
cd backend/Reference_documents
node server.js
# ✓ Doit afficher: "✅ Server started on port 3000"

# Terminal 3: Frontend
cd frontend/learnflow
npm run dev
# ✓ Doit afficher: "VITE ... ready in X ms"
```

## 🧪 Scénarios de Test

### Test 1: Navigation vers l'onglet
**Prérequis:** Être connecté en tant qu'étudiant

**Étapes:**
1. Ouvrir http://localhost:5173
2. Se connecter avec un compte étudiant
3. Cliquer sur l'avatar (haut-droit) → "Mon Profil"
4. Attendre le chargement

**Résultat attendu:**
- [ ] Le profil se charge
- [ ] 2 onglets sont visibles: "Informations Personnelles" et "Mes Absences & Éliminations"
- [ ] L'onglet "Mes Absences & Éliminations" a une icône ⚠️
- [ ] Pas d'erreur dans la console

**Résultat obtenu:** _______________

---

### Test 2: Affichage des statistiques
**Prérequis:** Onglet "Mes Absences & Éliminations" visible

**Étapes:**
1. Cliquer sur l'onglet "Mes Absences & Éliminations"
2. Attendre le chargement des données
3. Observer les statistiques affichées

**Résultat attendu:**
- [ ] 4 cartes de statistiques s'affichent
- [ ] Les nombres correspondent aux données réelles
- [ ] Aucune valeur négative
- [ ] Pas de message d'erreur

**Cartes affichées:**
| Statistic | Valeur | ✓ |
|-----------|--------|---|
| Absences Total | ____ | |
| Non Justifiées | ____ | |
| Justifiées | ____ | |
| Présences | ____ | |

**Résultat obtenu:** _______________

---

### Test 3: Tableau des absences
**Prérequis:** Statistiques chargées

**Étapes:**
1. Observer le tableau "Historique des Absences"
2. Vérifier les colonnes
3. Vérifier les données
4. Tester la pagination si > 10 lignes

**Résultat attendu:**
- [ ] Tableau visible avec au minimum 1 ligne
- [ ] Colonnes: Matière, Type, Date, Enseignant, Motif, Statut, Notes
- [ ] Chaque absence affiche le type avec couleur
- [ ] Les dates sont formatées correctement (FR)
- [ ] Les statuts affichent une tag appropriée
- [ ] Pagination fonctionne si > 10 absences

**Exemple de ligne attendue:**
| Matière | Type | Date | Enseignant | Motif | Statut |
|---------|------|------|-----------|-------|--------|
| Mathématiques | 🔴 Absent | 17 nov. 2024 | Prof ID | - | 🟠 En attente |

**Résultat obtenu:** _______________

---

### Test 4: Calcul d'élimination
**Prérequis:** Tableau chargé

**Étapes:**
1. Observer le tableau "État d'élimination par matière"
2. Compter les cours et absences manuellement
3. Vérifier le calcul: (absences/total)*100

**Résultat attendu:**
- [ ] Une ligne par matière enseignée
- [ ] Colonne "Taux (%)" affiche le pourcentage
- [ ] Progress bar colorée: 🟢 vert si < 25%, 🔴 rouge si ≥ 25%
- [ ] État "ADMIS" si taux < 25%
- [ ] État "ÉLIMINÉ (25%+)" si taux ≥ 25%

**Exemple de calcul:**
- 10 cours, 3 absences = 30% → 🔴 ÉLIMINÉ
- 10 cours, 2 absences = 20% → 🟢 ADMIS
- 20 cours, 5 absences = 25% → 🔴 ÉLIMINÉ

**Résultat obtenu:** _______________

---

### Test 5: Types d'absences affichés
**Prérequis:** Tableau des absences chargé

**Étapes:**
1. Vérifier chaque type d'absence dans le tableau
2. Vérifier la couleur correspondante

**Types à tester:**
- [ ] 🟢 Présent (Vert)
- [ ] 🔴 Absent (Rouge)
- [ ] 🟠 Justifié (Orange)
- [ ] 🔵 Retard (Bleu)
- [ ] 🟣 Départ anticipé (Violet)

**Résultat obtenu:** _______________

---

### Test 6: Bouton Actualiser
**Prérequis:** Données chargées

**Étapes:**
1. Cliquer sur le bouton "Actualiser"
2. Observer le spinner
3. Attendre la fin du chargement

**Résultat attendu:**
- [ ] Bouton affiche un spinner pendant le chargement
- [ ] Les données se rechargent
- [ ] Message de succès "Absences chargées avec succès"
- [ ] Aucune erreur dans la console

**Résultat obtenu:** _______________

---

### Test 7: Responsive Design
**Étapes:**
1. Redimensionner la fenêtre (F12 → Device Toolbar)
2. Tester sur mobile (375px)
3. Tester sur tablette (768px)
4. Tester sur desktop (1920px)

**Résultat attendu:**
- [ ] Desktop: Statistiques sur une ligne, tableau complet
- [ ] Tablette: Statistiques sur 2 lignes, tableau scrollable
- [ ] Mobile: Statistiques empilées, tableau scrollable horizontal
- [ ] Pas de contenu coupé
- [ ] Pas d'overflow non géré

**Mobile (375px):**
```
[Stat 1]
[Stat 2]
[Stat 3]
[Stat 4]
[Tableau ↔]
```

**Résultat obtenu:** _______________

---

### Test 8: Gestion d'erreurs
**Prérequis:** Services actifs

**Étapes:**
1. Arrêter le service Reference_documents
2. Rafraîchir la page
3. Cliquer sur l'onglet
4. Observer le message d'erreur

**Résultat attendu:**
- [ ] Message d'erreur clair s'affiche
- [ ] Pas de crash de la page
- [ ] Bouton "Actualiser" toujours accessible
- [ ] Pas d'erreur de console grave

**Redémarrer le service et tester:**
1. Le chargement fonctionne à nouveau
2. Les données se rechargent correctement

**Résultat obtenu:** _______________

---

### Test 9: Données vides
**Prérequis:** Étudiant sans absences

**Étapes:**
1. Créer un étudiant sans données d'absences
2. Se connecter avec ce compte
3. Naviguer vers l'onglet

**Résultat attendu:**
- [ ] Les statistiques affichent 0
- [ ] Message "Aucune absence enregistrée"
- [ ] Icône Empty affichée
- [ ] Pas d'erreur

**Résultat obtenu:** _______________

---

### Test 10: Données de professeur
**Prérequis:** Connecté en tant qu'enseignant

**Étapes:**
1. Se connecter avec un compte professeur
2. Aller au profil
3. Vérifier la présence de l'onglet

**Résultat attendu:**
- [ ] L'onglet "Mes Absences & Éliminations" est ABSENT
- [ ] Seul "Informations Personnelles" est visible

**Résultat obtenu:** _______________

---

### Test 11: Clic sur les éléments du tableau
**Prérequis:** Tableau avec données

**Étapes:**
1. Survoler les cellules du tableau
2. Tester les tooltips
3. Cliquer sur les tags

**Résultat attendu:**
- [ ] Tooltip affiche l'information complète au survol
- [ ] Texte long tronqué correctement (…)
- [ ] Tags cliquables (pour futur filtrage)

**Résultat obtenu:** _______________

---

### Test 12: Performance
**Étapes:**
1. Ouvrir DevTools (F12)
2. Aller à l'onglet "Performance"
3. Enregistrer le chargement
4. Charger 100+ lignes d'absences

**Résultat attendu:**
- [ ] Chargement initial < 3s
- [ ] Pagination < 1s
- [ ] Pas de lag au scroll
- [ ] Pas de memory leak visible

**Temps de chargement:** _________ ms

**Résultat obtenu:** _______________

---

## 📋 Résumé des Résultats

| Test | Statut | Notes |
|------|--------|-------|
| 1. Navigation | ✓ / ✗ / ⚠️ | _______ |
| 2. Statistiques | ✓ / ✗ / ⚠️ | _______ |
| 3. Tableau absences | ✓ / ✗ / ⚠️ | _______ |
| 4. Calcul élimination | ✓ / ✗ / ⚠️ | _______ |
| 5. Types d'absences | ✓ / ✗ / ⚠️ | _______ |
| 6. Actualiser | ✓ / ✗ / ⚠️ | _______ |
| 7. Responsive | ✓ / ✗ / ⚠️ | _______ |
| 8. Gestion d'erreurs | ✓ / ✗ / ⚠️ | _______ |
| 9. Données vides | ✓ / ✗ / ⚠️ | _______ |
| 10. Role professeur | ✓ / ✗ / ⚠️ | _______ |
| 11. Tableau interactions | ✓ / ✗ / ⚠️ | _______ |
| 12. Performance | ✓ / ✗ / ⚠️ | _______ |

**Score global:** __/12

---

## 🐛 Bugs détectés

### Bug #1
- **Description:** ___________________
- **Reproduction:** ___________________
- **Sévérité:** 🔴 Critique / 🟠 Majeure / 🟡 Mineure
- **Solution:** ___________________

### Bug #2
- **Description:** ___________________
- **Reproduction:** ___________________
- **Sévérité:** 🔴 Critique / 🟠 Majeure / 🟡 Mineure
- **Solution:** ___________________

---

## ✨ Points positifs

- ______________________________
- ______________________________
- ______________________________

## 💡 Améliorations suggérées

- ______________________________
- ______________________________
- ______________________________

---

**Date du test:** _______________
**Testeur:** _______________
**Environnement:** Windows / Mac / Linux
**Navigateur:** _______________
