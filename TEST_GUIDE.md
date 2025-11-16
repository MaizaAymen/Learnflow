# 🧪 Guide de Test - Sélectionner et Assigner des Étudiants

## ⚡ Démarrage Rapide

### 1️⃣ Prérequis
- ✅ Node.js installé
- ✅ Tous les services démarrés
- ✅ Base de données avec étudiants et classes

### 2️⃣ Services à Démarrer

```bash
# Terminal 1 - Auth Service (port 4000)
cd backend/auth-service
npm install
npm start

# Terminal 2 - Reference Service (port 3000)
cd backend/Reference_documents
npm install
npm start

# Terminal 3 - Frontend (port 5173)
cd frontend/learnflow
npm install
npm run dev
```

### 3️⃣ Accès à la Fonctionnalité

**Option A - Via le Menu**
1. Allez sur `http://localhost:5173`
2. Dans le menu latéral, cliquez **"Gestion utilisateur"** → **"Gestion Étudiants Avancée"** → **"Sélectionner et Assigner"**

**Option B - URL Directe**
- `http://localhost:5173/students/assign`

**Option C - Tests Automatisés**
- `http://localhost:5173/students/assign/test`

---

## 📋 Checklist de Test Complet

### ✅ Test 1 : Chargement Initial
**À vérifier:**
- [ ] Page charge sans erreur
- [ ] Table affiche des étudiants
- [ ] Dropdown affiche des classes
- [ ] Aucun message d'erreur dans la console

**Actions:**
```
1. Accédez à /students/assign
2. Attendez le chargement (2-3 secondes max)
3. Vérifiez qu'il y a au moins 1 étudiant et 1 classe
```

### ✅ Test 2 : Sélection Simple
**À vérifier:**
- [ ] Checkboxes cliquables
- [ ] Compteur augmente au clic
- [ ] Ligne se met en évidence

**Actions:**
```
1. Cliquez sur la checkbox du 1er étudiant
2. Vérifiez le compteur: "1 étudiant(s) sélectionné(s)"
3. Cliquez sur le 2e étudiant
4. Vérifiez le compteur: "2 étudiant(s) sélectionné(s)"
```

### ✅ Test 3 : Sélection en Masse
**À vérifier:**
- [ ] "Tous" sélectionne tous les étudiants
- [ ] "Inverser" inverse la sélection
- [ ] "Aucun" déselectionne tous

**Actions:**
```
1. Cliquez "Tous" (dans la table)
2. Vérifiez tous les checkboxes sont cochés
3. Cliquez "Inverser"
4. Vérifiez tous les checkboxes sont décochés
5. Cliquez "Tous" à nouveau
6. Cliquez "Aucun"
7. Vérifiez tous les checkboxes sont décochés
```

### ✅ Test 4 : Sélection de Classe
**À vérifier:**
- [ ] Dropdown s'ouvre
- [ ] Toutes les classes s'affichent
- [ ] Sélection fonctionne

**Actions:**
```
1. Cliquez sur le dropdown "Sélectionner une classe"
2. Vérifiez qu'il y a au moins 1 classe
3. Sélectionnez la 1ère classe
4. Vérifiez le texte du dropdown change
```

### ✅ Test 5 : Assignation Valide
**À vérifier:**
- [ ] Bouton "Assigner" est actif
- [ ] Modal de confirmation s'affiche
- [ ] Les infos affichées sont correctes
- [ ] Message de succès s'affiche
- [ ] Table se rafraîchit
- [ ] Statuts changent en "Assigné"

**Actions:**
```
1. Sélectionnez 3 étudiants
2. Choisissez une classe
3. Cliquez "Assigner (3)"
4. Vérifiez la modal:
   - Affiche "3 étudiant(s)"
   - Affiche la classe correcte
   - Liste des 3 étudiants visible
5. Cliquez "Confirmer"
6. Attendez le message succès
7. Vérifiez que les 3 étudiants ont le badge "Assigné" vert
```

### ✅ Test 6 : Validations (Cas Négatifs)
**À vérifier:**
- [ ] Bouton "Assigner" désactivé si aucun étudiant sélectionné
- [ ] Bouton "Assigner" désactivé si aucune classe choisie
- [ ] Message d'avertissement s'affiche

**Actions:**
```
Test A - Pas de sélection:
1. Sans rien sélectionner
2. Choisissez une classe
3. Vérifiez bouton est grisé
4. Cliquez dessus (devrait rien faire)

Test B - Pas de classe:
1. Sélectionnez 2 étudiants
2. Ne choisissez pas de classe
3. Vérifiez bouton est grisé
4. Changez la sélection de classe à "vide"
5. Vérifiez bouton reste grisé
```

### ✅ Test 7 : Retrait d'Étudiants
**À vérifier:**
- [ ] Bouton "Retirer" visible pour étudiants assignés
- [ ] Modal de confirmation s'affiche
- [ ] Retrait fonctionne
- [ ] Statut change en "Non assigné"

**Actions:**
```
1. Trouvez un étudiant avec badge "Assigné" vert
2. Cliquez "Retirer"
3. Vérifiez confirmation demandée
4. Cliquez "Oui"
5. Attendez message succès
6. Vérifiez badge change en orange "Non assigné"
7. Vérifiez bouton "Retirer" disparaît
```

### ✅ Test 8 : Pagination
**À vérifier:**
- [ ] Pagination fonctionne
- [ ] 15 étudiants par page
- [ ] Sélections maintenues lors du changement de page

**Actions:**
```
1. Verifiez le nombre total d'étudiants
2. Cliquez sur page 2 (si existe)
3. Vérifiez nouveaux étudiants s'affichent
4. Retournez page 1
5. Vérifiez sélections précédentes maintenues
```

### ✅ Test 9 : Filtres de Table
**À vérifier:**
- [ ] Tri par colonne fonctionne
- [ ] Recherche par colonne fonctionne (si disponible)

**Actions:**
```
1. Cliquez en-tête colonne "Nom"
2. Vérifiez tri croissant/décroissant
3. Cherchez un étudiant spécifique
```

### ✅ Test 10 : Responsivité
**À vérifier:**
- [ ] Desktop (1920px+) : Tout visible
- [ ] Tablette (768px-1024px) : Adaptée
- [ ] Mobile (< 768px) : Tableau avec défilement

**Actions:**
```
1. F12 → Outils développeur
2. Cliquez icône "Toggle device toolbar"
3. Testez à 1920px, 768px, 375px
4. Vérifiez responsivité
```

---

## 🔴 Erreurs Communes et Solutions

### ❌ Erreur: "Aucun étudiant trouvé"
**Cause:** Auth service n'a pas d'étudiants
**Solution:**
```bash
# Vérifiez la base de données auth-service
# Vérifiez qu'il y a des utilisateurs avec role='etudiant'
# Importez des étudiants via /upload-students
```

### ❌ Erreur: "Aucune classe trouvée"
**Cause:** Reference service n'a pas de classes
**Solution:**
```bash
# Créez des classes via /reference/classes
# Ou importez-les via l'interface d'administration
```

### ❌ Erreur: "Impossible de se connecter au serveur"
**Cause:** Services ne sont pas démarrés
**Solution:**
```bash
# Vérifiez port 3000 et 4000 en écoute
lsof -i :3000
lsof -i :4000
# Redémarrez les services
```

### ❌ Erreur: "CORS error"
**Cause:** Frontend et backend sur des domaines différents
**Solution:**
```bash
# Vérifiez configuration CORS dans backend
# Doit permettre http://localhost:5173
```

### ❌ Table vide mais pas d'erreur
**Cause:** Requête lente ou données chargent lentement
**Solution:**
```bash
# Vérifiez requête réseau (F12 → Network)
# Attendez 5 secondes
# Rafraîchissez (F5)
```

---

## 🎬 Scénarios de Test Complète

### 📌 Scénario 1: Workflow Complet
```
Objectif: Assigner 50 étudiants à la classe "1A"

Étapes:
1. Page /students/assign
2. Sélectionnez "Tous" (50 étudiants)
3. Choisissez classe "1A"
4. Cliquez "Assigner (50)"
5. Confirmez
6. Vérifiez message succès
7. Rafraîchissez
8. Vérifiez tous affichent "Assigné"

Temps: ~30 secondes
```

### 📌 Scénario 2: Correction d'Erreur
```
Objectif: Corriger assignation de 5 étudiants

Étapes:
1. Page /students/assign
2. Trouvez 5 étudiants mal assignés
3. Retirez-les 1 par 1
4. Sélectionnez-les à nouveau
5. Choisissez bonne classe
6. Assignez
7. Confirmez

Temps: ~1 minute
```

### 📌 Scénario 3: Déplacement de Groupe
```
Objectif: Déplacer groupe d'étudiants de "1A" à "1B"

Étapes:
1. Page /students/assign
2. Filtrez par classe "1A" (si possible)
3. Sélectionnez groupe à déplacer
4. Choisissez classe "1B"
5. Assignez
6. Confirmez

Temps: ~45 secondes
```

---

## 🧪 Test Automatisé

Allez sur `http://localhost:5173/students/assign/test`

**Tests disponibles:**
- ✅ Component Rendering
- ✅ Fetch Students
- ✅ Fetch Classes
- ✅ Bulk Assignment Endpoint
- ✅ Remove from Class Endpoint

**À faire:**
```
1. Cliquez "Run All Tests"
2. Attendez résultats
3. Vérifiez tout en PASS (vert)
4. Si FAIL: Consultez détails et logs
```

---

## 📊 Métriques de Performance

### ✅ Temps de Chargement
- **Initial:** < 3 secondes (avec données)
- **Assignation:** < 1 seconde
- **Retrait:** < 1 seconde

### ✅ Limite de Sélection
- **Maximum étudiants:** Pas de limite
- **Maximum par assignation:** Dépend du serveur (100+ recommandé)

### ✅ Mémoire
- **Page:** < 50 MB
- **Sélection 1000 étudiants:** < 100 MB

---

## 📝 Log des Tests

**À conserver:**
```
Date: [DATE]
Testeur: [NOM]
Version: 1.0
Résultat Global: ✅ PASS / ❌ FAIL

Tests Réussis:
- Test 1: ✅
- Test 2: ✅
...

Bugs Trouvés:
- Bug 1: [DESCRIPTION]
- Bug 2: [DESCRIPTION]

Notes:
[NOTES]
```

---

## 🚀 Checklist de Déploiement Final

Avant de déployer en production :

- [ ] Tous les tests manuels passent
- [ ] Test automatisé au complet (vert)
- [ ] Pas d'erreurs dans la console
- [ ] Performance acceptable
- [ ] Documentation lue et comprise
- [ ] Backups effectués
- [ ] Tests de sécurité OK
- [ ] Documentation mise à jour

---

## 📞 Support

**En cas de problème:**

1. **Consultez les logs:**
   ```bash
   # Frontend
   F12 → Console
   
   # Backend Auth
   npm start (voir logs)
   
   # Backend Reference
   npm start (voir logs)
   ```

2. **Consultez la documentation:**
   - `STUDENT_BULK_ASSIGNMENT_GUIDE.md` - Guide utilisateur
   - `BULK_ASSIGNMENT_IMPLEMENTATION.md` - Guide technique

3. **Testez les endpoints:**
   ```bash
   # Postman ou curl
   curl http://localhost:4000/api/auth/getallstudents
   curl http://localhost:3000/api/reference/classes
   ```

---

**Guide de Test Complet** ✅  
**Version:** 1.0  
**Date:** 2024-2025  
**Prêt pour Test**
