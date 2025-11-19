# NotificationService - Microservice de Notifications pour Learnflow

## 🎯 Vue d'ensemble

Le **NotificationService** est un microservice complet et autonome qui gère toutes les notifications internes de la plateforme Learnflow. Il utilise la même architecture, base de données et conventions que les autres services.

## 📋 Table des matières

1. [Types de Notifications](#types-de-notifications)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Webhooks](#webhooks)
7. [Déclencheurs](#déclencheurs)
8. [Exemples d'Utilisation](#exemples-dutilisation)
9. [Base de Données](#base-de-données)

---

## 📭 Types de Notifications

Le service supporte 9 types de notifications principales :

### 1. **event_created** 📅
- **Déclencheur** : Nouvel événement créé
- **Destinataires** : Étudiants de la classe concernée
- **Titre** : "📅 Nouvel Événement"
- **Contenu** : Détails de l'événement
- **Priorité** : High

### 2. **event_registered** 🎓
- **Déclencheur** : Étudiant inscrit à un événement
- **Destinataires** : Créateur de l'événement
- **Titre** : "🎓 Nouvelle Inscription"
- **Contenu** : Informations sur l'étudiant inscrit
- **Priorité** : Medium

### 3. **absence_registered** 📝
- **Déclencheur** : Absence enregistrée
- **Destinataires** : Étudiant concerné
- **Titre** : "📝 Absence Enregistrée"
- **Contenu** : Détails du cours et date
- **Priorité** : High

### 4. **elimination_risk** ⚠️
- **Déclencheur** : Risque d'élimination détecté
- **Destinataires** : Étudiant + Chef de département
- **Titre** : "⚠️ Risque d'Élimination"
- **Contenu** : Nombre d'absences et raison
- **Priorité** : Critical

### 5. **schedule_changed** 📅
- **Déclencheur** : Changement d'emploi du temps
- **Destinataires** : Tous les étudiants de la classe
- **Titre** : "📅 Changement d'Emploi du Temps"
- **Contenu** : Ancien et nouvel horaire
- **Priorité** : High

### 6. **message_received** 📥
- **Déclencheur** : Nouveau message dans la messagerie
- **Destinataires** : Destinataire du message
- **Titre** : "📥 Nouveau Message"
- **Contenu** : Aperçu du message
- **Priorité** : Medium

### 7. **document_published** 📄
- **Déclencheur** : Document publié
- **Destinataires** : Utilisateurs concernés
- **Titre** : "📄 Nouveau Document"
- **Contenu** : Titre et type du document
- **Priorité** : Medium

### 8. **announcement_published** 📢
- **Déclencheur** : Annonce publiée
- **Destinataires** : Utilisateurs concernés
- **Titre** : "📢 Nouvelle Annonce"
- **Contenu** : Contenu de l'annonce
- **Priorité** : High

### 9. **account_created** 🔐
- **Déclencheur** : Nouveau compte créé
- **Destinataires** : Nouvel utilisateur
- **Titre** : "🔐 Compte Créé"
- **Contenu** : Instructions de connexion
- **Priorité** : Critical

---

## 🏗️ Architecture

```
Service de Notifications/
├── models/
│   ├── Notification.js          # Modèle principal
│   ├── NotificationPreference.js # Préférences utilisateur
│   ├── NotificationLog.js        # Historique des notifications
│   └── index.js                  # Relations et exports
├── routes/
│   ├── notifications.js          # CRUD notifications
│   ├── preferences.js            # Préférences utilisateur
│   └── webhooks.js               # Réception webhooks
├── services/
│   ├── NotificationService.js    # Logique métier
│   └── EventBridgeService.js     # Intégration inter-services
├── server.js                     # Point d'entrée
├── package.json                  # Dépendances
└── README.md                     # Cette documentation
```

### Schéma de la Base de Données

#### Table `notifications`
```sql
CREATE TABLE referentiels.notifications (
  id UUID PRIMARY KEY,
  recipient_id INTEGER NOT NULL,           -- FK auth.utilisateur
  type ENUM(...),                          -- Type de notification
  title VARCHAR(255),
  content TEXT,
  metadata JSON,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  priority ENUM('low', 'medium', 'high', 'critical'),
  action_url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Table `notification_preferences`
```sql
CREATE TABLE referentiels.notification_preferences (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL,                -- FK auth.utilisateur
  event_created BOOLEAN DEFAULT true,
  event_registered BOOLEAN DEFAULT true,
  absence_registered BOOLEAN DEFAULT true,
  elimination_risk BOOLEAN DEFAULT true,
  schedule_changed BOOLEAN DEFAULT true,
  message_received BOOLEAN DEFAULT true,
  document_published BOOLEAN DEFAULT true,
  announcement_published BOOLEAN DEFAULT true,
  account_created BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Table `notification_logs`
```sql
CREATE TABLE referentiels.notification_logs (
  id UUID PRIMARY KEY,
  notification_id UUID NOT NULL,
  event_type VARCHAR(100),
  trigger_source VARCHAR(100),
  source_id VARCHAR(36),
  delivery_status ENUM('pending', 'delivered', 'failed'),
  delivery_method ENUM('in_app', 'email', 'sms', 'webhook'),
  error_message TEXT,
  retry_count INTEGER,
  last_retry_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 📦 Installation

### 1. Installation des dépendances
```bash
cd "Service de Notifications"
npm install
```

### 2. Configuration (.env)
```env
PORT=3005
DATABASE_URL=postgres://postgres:aymen@localhost:5432/auth_service
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Démarrage du service
```bash
npm start
# ou en développement avec nodemon
npm run dev
```

### Vérification
```bash
curl http://localhost:3005/health
```

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port d'écoute | 3005 |
| `DATABASE_URL` | URL de la base de données | postgres://... |
| `FRONTEND_URL` | URL du frontend | http://localhost:5173 |
| `NODE_ENV` | Environnement | development |

### Configuration de la Base de Données

Le service utilise la même base de données que les autres services (`auth_service`) avec le schéma `referentiels`.

---

## 🔌 API Endpoints

### Notifications

#### GET /api/notifications
Récupérer toutes les notifications de l'utilisateur

**Query Parameters:**
- `page` (default: 1) - Numéro de page
- `limit` (default: 20) - Notifications par page
- `unread_only` (default: false) - Afficher uniquement les non-lues

**Response:**
```json
{
  "total": 25,
  "page": 1,
  "limit": 20,
  "notifications": [
    {
      "id": "uuid",
      "recipient_id": 123,
      "type": "event_created",
      "title": "📅 Nouvel Événement",
      "content": "...",
      "metadata": {...},
      "is_read": false,
      "priority": "high",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET /api/notifications/unread/count
Compter les notifications non-lues

**Response:**
```json
{
  "unread_count": 5
}
```

#### GET /api/notifications/:id
Récupérer une notification spécifique

**Response:**
```json
{
  "id": "uuid",
  "recipient_id": 123,
  "type": "event_created",
  "title": "...",
  "content": "...",
  "logs": [...]
}
```

#### PUT /api/notifications/:id/read
Marquer une notification comme lue

**Response:**
```json
{
  "message": "✅ Notification marked as read",
  "notification": {...}
}
```

#### PUT /api/notifications/read/all
Marquer toutes les notifications comme lues

**Response:**
```json
{
  "message": "✅ 5 notifications marked as read"
}
```

#### DELETE /api/notifications/:id
Supprimer une notification

**Response:**
```json
{
  "message": "✅ Notification deleted"
}
```

#### DELETE /api/notifications/delete/batch
Supprimer plusieurs notifications

**Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "message": "✅ 3 notifications deleted"
}
```

### Préférences

#### GET /api/preferences
Récupérer les préférences de notifications

**Response:**
```json
{
  "id": "uuid",
  "user_id": 123,
  "event_created": true,
  "event_registered": true,
  "absence_registered": true,
  "elimination_risk": true,
  "schedule_changed": true,
  "message_received": true,
  "document_published": true,
  "announcement_published": true,
  "account_created": true,
  "email_enabled": false,
  "sms_enabled": false,
  "quiet_hours_start": null,
  "quiet_hours_end": null
}
```

#### PUT /api/preferences
Mettre à jour les préférences

**Body:**
```json
{
  "event_created": false,
  "email_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}
```

**Response:**
```json
{
  "message": "✅ Preferences updated",
  "preferences": {...}
}
```

#### PUT /api/preferences/notification-type/:type
Activer/Désactiver un type spécifique

**Body:**
```json
{
  "enabled": false
}
```

**Response:**
```json
{
  "message": "✅ event_created toggled to false",
  "preferences": {...}
}
```

#### PUT /api/preferences/quiet-hours
Définir les heures calmes (sans notifications)

**Body:**
```json
{
  "start_time": "22:00:00",
  "end_time": "08:00:00"
}
```

**Response:**
```json
{
  "message": "✅ Quiet hours updated",
  "preferences": {...}
}
```

---

## 🪝 Webhooks

Le service reçoit des webhooks d'autres services via l'endpoint `/api/webhooks/`.

### Format de Webhook

```json
{
  "type": "event_type_string",
  "data": {
    // Données spécifiques à l'événement
  }
}
```

### Webhooks Disponibles

#### POST /api/webhooks/events
Depuis le service Événements

```json
{
  "type": "event.created",
  "data": {
    "event_id": "uuid",
    "title": "Réunion de classe",
    "class_id": "uuid",
    "student_ids": [1, 2, 3],
    "event_creator_id": 5
  }
}
```

#### POST /api/webhooks/reference
Depuis le service Référence

```json
{
  "type": "absence.registered",
  "data": {
    "absence_id": "uuid",
    "student_id": 123,
    "course_name": "Mathématiques",
    "date": "2024-01-15"
  }
}
```

#### POST /api/webhooks/messaging
Depuis le service Messagerie

```json
{
  "type": "message.received",
  "data": {
    "message_id": "uuid",
    "recipient_id": 123,
    "sender_name": "Jean Dupont",
    "message_preview": "Bonjour, comment ça va..."
  }
}
```

#### POST /api/webhooks/auth
Depuis le service Auth

```json
{
  "type": "account.created",
  "data": {
    "user_id": 123,
    "temp_password": "TempPwd123!",
    "email": "user@example.com",
    "user_name": "Jean Dupont"
  }
}
```

#### POST /api/webhooks/content
Pour documents et annonces

```json
{
  "type": "document.published",
  "data": {
    "document_id": "uuid",
    "document_title": "Cours de Maths",
    "department_id": "uuid",
    "user_ids": [1, 2, 3],
    "document_type": "PDF"
  }
}
```

---

## 🔔 Déclencheurs

Les déclencheurs sont gérés par le `NotificationService`. Voici comment intégrer le service :

### 1. Depuis le Service Événements

```javascript
// Dans Gestion des Événements/server.js
const axios = require('axios');

// Après création d'un événement
const notifyEvent = async (eventData) => {
  await axios.post('http://localhost:3005/api/webhooks/events', {
    type: 'event.created',
    data: {
      event_id: eventData.id,
      title: eventData.title,
      class_id: eventData.class_id,
      student_ids: eventData.student_ids,
      event_creator_id: eventData.created_by
    }
  });
};
```

### 2. Depuis le Service Référence

```javascript
// Dans Reference_documents/routes/Students.js
const notifyAbsence = async (absenceData) => {
  await axios.post('http://localhost:3005/api/webhooks/reference', {
    type: 'absence.registered',
    data: {
      absence_id: absenceData.id,
      student_id: absenceData.student_id,
      course_name: absenceData.course_name,
      date: absenceData.date
    }
  });
};
```

### 3. Depuis le Service Messagerie

```javascript
// Dans Messagerie/routes/messaging.js
const notifyMessage = async (messageData) => {
  await axios.post('http://localhost:3005/api/webhooks/messaging', {
    type: 'message.received',
    data: {
      message_id: messageData.id,
      recipient_id: messageData.recipient_id,
      sender_name: messageData.sender_name,
      message_preview: messageData.content.substring(0, 100)
    }
  });
};
```

---

## 💡 Exemples d'Utilisation

### Exemple 1 : Tester une notification

```bash
curl -X POST http://localhost:3005/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 123,
    "type": "event_created",
    "title": "📅 Nouvel Événement",
    "content": "Un nouvel événement a été créé pour votre classe",
    "priority": "high"
  }'
```

### Exemple 2 : Récupérer les notifications non-lues

```bash
curl "http://localhost:3005/api/notifications?unread_only=true&limit=10"
```

### Exemple 3 : Marquer toutes comme lues

```bash
curl -X PUT http://localhost:3005/api/notifications/read/all
```

### Exemple 4 : Mettre à jour les préférences

```bash
curl -X PUT http://localhost:3005/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "event_created": false,
    "email_enabled": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "08:00"
  }'
```

### Exemple 5 : Déclencher un événement manuellement

```bash
curl -X POST http://localhost:3005/api/admin/trigger-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "event_created",
    "data": {
      "event_id": "evt-123",
      "title": "Réunion",
      "class_id": "cls-456",
      "student_ids": [1, 2, 3],
      "event_creator_id": 5
    }
  }'
```

---

## 📊 Base de Données

### Initialization

Le service crée automatiquement les tables lors du démarrage :

```bash
npm start
```

Output :
```
✅ Referentiels schema created/verified
✅ All Notifications models synced with DB
✅ Foreign key constraints enabled
✅ Notifications Service Started Successfully
📍 Server running on port: 3005
```

### Vérifier les tables

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'referentiels' AND table_name LIKE 'notification%';
```

### Requêtes SQL utiles

```sql
-- Toutes les notifications d'un utilisateur
SELECT * FROM referentiels.notifications WHERE recipient_id = 123;

-- Notifications non-lues
SELECT * FROM referentiels.notifications 
WHERE recipient_id = 123 AND is_read = false;

-- Compter les notifications par type
SELECT type, COUNT(*) FROM referentiels.notifications GROUP BY type;

-- Logs de livraison
SELECT * FROM referentiels.notification_logs WHERE delivery_status = 'failed';
```

---

## 🚀 Intégration avec d'autres services

### Ajouter dans chaque service

1. **Importer axios**
```bash
npm install axios
```

2. **Appeler le webhook après action**
```javascript
const axios = require('axios');
const notificationService = 'http://localhost:3005';

// Après une action
await axios.post(`${notificationService}/api/webhooks/reference`, {
  type: 'event_type',
  data: {...}
});
```

---

## 📝 Notes

- Les notifications sont stockées dans la même BD que les autres services
- Le service respecte l'architecture existante
- Les préférences utilisateur sont toujours respectées
- Les notifications peuvent être testées via les endpoints admin
- Les webhooks sont asynchrones et ne bloquent pas la réponse

---

## ❓ Dépannage

**Q: Les tables ne sont pas créées?**
A: Vérifiez que PostgreSQL est en cours d'exécution et que la BD `auth_service` existe.

**Q: Les notifications ne sont pas reçues?**
A: Vérifiez les webhooks vers `localhost:3005/api/webhooks/`

**Q: Comment réinitialiser les données?**
A: Supprimez les tables et relancez le service :
```sql
DROP TABLE referentiels.notification_logs;
DROP TABLE referentiels.notifications;
DROP TABLE referentiels.notification_preferences;
```

