# 📋 Sélectionner et Assigner des Étudiants à une Classe

## Description

La nouvelle feature **"Sélectionner et Assigner des Étudiants"** permet aux administrateurs de :
- 👥 **Visualiser la liste de tous les étudiants**
- ☑️ **Sélectionner plusieurs étudiants** (sélection simple, par groupe ou en masse)
- 📚 **Assigner rapidement les étudiants sélectionnés à une classe**
- ❌ **Retirer des étudiants d'une classe**

## Accès à la Fonctionnalité

### Via le Menu
1. Allez sur **"Gestion Utilisateurs"** → **"Gestion Étudiants Avancée"**
2. Cliquez sur **"Sélectionner et Assigner"**
3. Ou accédez directement via l'URL : `/students/assign`

### Depuis le Dashboard
- Recherchez l'option dans le menu latéral gauche
- Section : **"Gestion Étudiants Avancée"**

## Fonctionnalités Détaillées

### 1️⃣ Sélectionner des Étudiants

#### Sélection Simple
- Cliquez sur la **checkbox** à gauche de chaque étudiant
- L'étudiant sera surligné et compté dans le compteur

#### Sélection en Masse
- **"Tous"** : Sélectionne tous les étudiants de la page
- **"Inverser"** : Inverse la sélection (sélectionne les non-sélectionnés, désélectionne les sélectionnés)
- **"Aucun"** : Désélectionne tous les étudiants

#### Compteur de Sélection
- Affiche le **nombre d'étudiants sélectionnés**
- Se met à jour en temps réel
- Les filtres de table sont appliqués

### 2️⃣ Choisir une Classe

1. Utilisez le **dropdown "Sélectionner une classe"** en haut
2. Choisissez la classe cible dans la liste
3. La sélection reste active jusqu'à confirmation

### 3️⃣ Assigner les Étudiants

#### Bouton d'Assignation
- Le bouton **"Assigner"** affiche le nombre d'étudiants à assigner
- Il est **désactivé** si :
  - ❌ Aucun étudiant n'est sélectionné
  - ❌ Aucune classe n'est choisie

#### Confirmation d'Assignation
Une fenêtre de confirmation s'affiche montrant :
- 📊 Nombre d'étudiants à assigner
- 📚 Classe cible
- 👥 Liste des étudiants (avec défilement)

#### Après Confirmation
- ✅ Les étudiants sont assignés à la classe
- 🔄 La liste se rafraîchit automatiquement
- 📌 Les étudiants assignés affichent **"Assigné"** en vert
- ✔️ Le compteur se réinitialise

### 4️⃣ Retirer des Étudiants d'une Classe

#### Pour un Étudiant Assigné
1. Cherchez l'étudiant avec le badge **"Assigné"** en vert
2. Cliquez sur le bouton **"Retirer"**
3. Confirmez l'action
4. L'étudiant devient **"Non assigné"** (badge orange)

#### Retrait en Masse
- Sélectionnez plusieurs étudiants assignés
- Utilisez l'assignation à une classe spéciale (si disponible) ou retirez-les individuellement

### 5️⃣ Filtrer et Rechercher

#### Vue Globale
- **Assignés** : Étudiants déjà affectés à une classe (badge vert)
- **Non assignés** : Étudiants sans classe affectée (badge orange)

#### Statut dans le Tableau
- La colonne **"Actions"** montre le statut de chaque étudiant
- Les boutons disponibles dépendent du statut

## Statistiques

En haut de la page, vous verrez :
- 📊 **Total des étudiants assignés**
- 📊 **Total des étudiants non assignés**

## Cas d'Usage

### 🎯 Scénario 1 : Assigner une promotion entière à une classe
1. Sélectionnez **"Tous"** pour cocher tous les étudiants
2. Choisissez la classe (ex: "1A Informatique")
3. Cliquez **"Assigner"**
4. Confirmez

### 🎯 Scénario 2 : Assigner des étudiants spécifiques
1. Cherchez les étudiants via le tableau (pagination, tri)
2. Sélectionnez-les manuellement
3. Choisissez la classe cible
4. Cliquez **"Assigner"**

### 🎯 Scénario 3 : Changer la classe d'un groupe d'étudiants
1. Sélectionnez les étudiants à déplacer
2. Choisissez la nouvelle classe
3. Cliquez **"Assigner"**

### 🎯 Scénario 4 : Retirer des étudiants d'une classe
1. Cherchez l'étudiant avec le statut **"Assigné"**
2. Cliquez **"Retirer"**
3. Confirmez la suppression

## 🔐 Permissions

- ✅ **Admin** : Accès complet
- ✅ **Enseignants** : Dépend de la configuration
- ❌ **Étudiants** : Pas d'accès

## 💡 Conseils d'Utilisation

### ⚡ Optimisations
1. **Utilisez la sélection en masse** pour assigner rapidement de grands groupes
2. **Triez par spécialité** avant d'assigner (si possible)
3. **Vérifiez la classe cible** avant de confirmer

### ⚠️ Attention
- L'assignation est **immédiate** après confirmation
- Vous pouvez **changer** la classe d'un étudiant en l'assignant à une autre
- Les assignations sont **enregistrées en base de données**

### 📋 Recommandations
1. **Avant d'assigner en masse**, vérifiez le nombre d'étudiants sélectionnés
2. **Confirmez les classes** avant chaque assignation
3. **Utilisez le retrait** pour corriger les erreurs

## ⚙️ Intégration Backend

### Endpoints API

#### POST `/api/students/assign-to-class`
Assigne plusieurs étudiants à une classe
```json
{
  "studentIds": [1, 2, 3],
  "classeId": 5
}
```

#### PUT `/api/students/:id/remove-from-class`
Retire un étudiant d'une classe
```json
Response: { message: "Student removed successfully" }
```

#### GET `/api/auth/getallstudents`
Récupère la liste de tous les étudiants
```json
Response: [{ id, nom, prenom, email, specialite, classe_id, ... }]
```

#### GET `/api/reference/classes`
Récupère la liste des classes disponibles
```json
Response: [{ id, nom, niveau_id, ... }]
```

## 🎨 Interface

### Composants Ant Design Utilisés
- ✅ **Table** : Affichage des étudiants avec checkboxes
- ✅ **Select** : Sélection de classe
- ✅ **Button** : Actions principales
- ✅ **Modal** : Confirmation d'assignation
- ✅ **Tag** : Affichage des statuts
- ✅ **Alert** : Messages informatifs

### États Visuels
- 🔵 **Bleu** : Actions principales
- 🟢 **Vert** : Succès / Assigné
- 🟠 **Orange** : Non assigné
- 🔴 **Rouge** : Danger / Retirer

## 📱 Responsivité

La page s'adapte à tous les écrans :
- **Desktop** : Vue complète avec tous les contrôles
- **Tablette** : Mise en page adaptée
- **Mobile** : Défilement horizontal du tableau

## 🆘 Dépannage

### Problème : Aucun étudiant n'apparaît
- **Vérifiez** la connexion au serveur auth (port 4000)
- **Vérifiez** qu'il y a des étudiants enregistrés
- **Consultez** la console pour les erreurs

### Problème : L'assignation échoue
- **Vérifiez** que la classe existe
- **Vérifiez** les permissions
- **Consultez** la console du navigateur pour les détails

### Problème : Les changements ne s'affichent pas
- **Rafraîchissez** la page (F5 ou Ctrl+R)
- **Vérifiez** la connexion réseau
- **Vérifiez** les logs du serveur

## 📚 Documentation Connexe

- [Gestion des Étudiants](../COMPLETE_FILE_STRUCTURE.md)
- [Gestion des Classes](./ClasseManagementSimple.jsx)
- [Gestion Avancée des Étudiants](./UserManagement.jsx)

---

**Version** : 1.0  
**Dernière mise à jour** : $(date)  
**Auteur** : Learnflow Admin
