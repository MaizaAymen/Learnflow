# 📨 Service Messagerie Interne - Documentation Complète

## 🎯 Vue d'ensemble

Le service Messagerie Interne est un service indépendant qui permet la communication en temps réel entre :
- **Étudiants ↔ Enseignants**
- **Étudiants ↔ Administration**
- **Enseignants ↔ Administration**
- Conversations en groupe par classe (optionnel)

## 📋 Architecture

### Structure des Fichiers

```
backend/Messagerie/
├── config/
│   └── database.js          # Configuration PostgreSQL Sequelize
├── models/
│   ├── Message.js           # Modèle pour les messages
│   ├── Conversation.js      # Modèle pour les conversations
│   ├── ConversationParticipant.js  # Modèle pour les participants
│   ├── UserOnlineStatus.js  # Modèle pour le statut en ligne
│   └── index.js             # Export des modèles
├── routes/
│   └── messaging.js         # Routes REST API
├── services/
│   └── MessagingService.js  # Service WebSocket Socket.io
├── middleware/
│   └── auth.js              # Middleware JWT
├── server.js                # Serveur Express + Socket.io
├── package.json             # Dépendances
└── .env                     # Configuration d'environnement
```

### Base de Données

Le service utilise la **même base de données PostgreSQL** que les autres services (schema `referentiels`).

#### Modèles de Données

**1. Conversations**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type ENUM('direct', 'group'),
  group_name VARCHAR(255),
  created_by INTEGER,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**2. Messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  sender_id INTEGER,
  content TEXT,
  is_read BOOLEAN,
  read_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**3. Conversation Participants**
```sql
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  user_id INTEGER,
  joined_at TIMESTAMP,
  left_at TIMESTAMP
);
```

**4. User Online Status**
```sql
CREATE TABLE user_online_status (
  id UUID PRIMARY KEY,
  user_id INTEGER UNIQUE,
  is_online BOOLEAN,
  last_seen TIMESTAMP,
  socket_id VARCHAR(255)
);
```

## 🚀 Installation & Setup

### Backend

1. **Installer les dépendances**
```bash
cd backend/Messagerie
npm install
```

2. **Configurer les variables d'environnement** (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=learnflow
DB_USER=postgres
DB_PASSWORD=password

PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

3. **Démarrer le service**
```bash
npm start
```

Ou en mode développement avec hot-reload:
```bash
npm run dev
```

### Frontend

1. **Installer socket.io-client**
```bash
cd frontend/learnflow
npm install socket.io-client
```

2. **Configurer l'URL du service** (variables d'environnement)
```env
REACT_APP_MESSAGING_URL=http://localhost:3001
```

3. **Intégrer les composants dans votre app**

## 📡 API REST Endpoints

### Conversations

#### Créer une nouvelle conversation
```http
POST /api/messaging/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "direct",
  "participant_ids": [2],
  "group_name": null
}
```

**Réponse (201)**
```json
{
  "id": "uuid",
  "type": "direct",
  "group_name": null,
  "created_at": "2024-11-18T10:30:00Z"
}
```

#### Récupérer les conversations de l'utilisateur
```http
GET /api/messaging/conversations?page=1&limit=20
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "type": "direct",
      "group_name": null,
      "last_message": "Bonjour!",
      "last_message_at": "2024-11-18T10:30:00Z",
      "unread_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Messages

#### Récupérer les messages d'une conversation
```http
GET /api/messaging/conversations/<conversationId>/messages?page=1&limit=30
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": 1,
      "content": "Bonjour!",
      "is_read": true,
      "read_at": "2024-11-18T10:32:00Z",
      "created_at": "2024-11-18T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 5,
    "pages": 1
  }
}
```

#### Envoyer un message
```http
POST /api/messaging/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "uuid",
  "content": "Bonjour!"
}
```

**Réponse (201)**
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": 1,
  "content": "Bonjour!",
  "is_read": false,
  "created_at": "2024-11-18T10:30:00Z"
}
```

### Utilisateurs

#### Rechercher des utilisateurs
```http
GET /api/messaging/search-users?query=Ahmed&limit=10
Authorization: Bearer <token>
```

**Réponse (200)**
```json
[
  {
    "id": 2,
    "nom": "Ahmed",
    "prenom": "Mohammed",
    "email": "ahmed@example.com",
    "role": "enseignant"
  }
]
```

#### Obtenir le nombre de messages non lus
```http
GET /api/messaging/unread-count
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "unread_count": 3
}
```

#### Obtenir le statut en ligne d'un utilisateur
```http
GET /api/messaging/online-status/:userId
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "is_online": true,
  "last_seen": "2024-11-18T10:35:00Z"
}
```

### Conversations

#### Quitter une conversation
```http
DELETE /api/messaging/conversations/<conversationId>
Authorization: Bearer <token>
```

**Réponse (200)**
```json
{
  "message": "Conversation deleted"
}
```

## 🔌 WebSocket Events

### Événements Client → Serveur

#### `connect`
Établit la connexion avec le serveur WebSocket
```javascript
socket.on('connect', () => {
  console.log('Connected');
});
```

#### `send_message`
Envoie un message en temps réel
```javascript
socket.emit('send_message', {
  conversation_id: 'uuid',
  content: 'Hello!'
});
```

#### `typing`
Indique que l'utilisateur tape
```javascript
socket.emit('typing', {
  conversation_id: 'uuid'
});
```

#### `stop_typing`
Indique que l'utilisateur a arrêté de taper
```javascript
socket.emit('stop_typing', {
  conversation_id: 'uuid'
});
```

#### `join_conversation`
Rejoindre une salle de conversation
```javascript
socket.emit('join_conversation', {
  conversation_id: 'uuid'
});
```

#### `leave_conversation`
Quitter une salle de conversation
```javascript
socket.emit('leave_conversation', {
  conversation_id: 'uuid'
});
```

### Événements Serveur → Client

#### `new_message`
Nouveau message reçu
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
  // {
  //   id: 'uuid',
  //   conversation_id: 'uuid',
  //   sender_id: 1,
  //   content: 'Hello!',
  //   is_read: false,
  //   created_at: '2024-11-18T10:30:00Z'
  // }
});
```

#### `message_sent`
Message envoyé avec succès
```javascript
socket.on('message_sent', (data) => {
  console.log('Message sent:', data.id);
});
```

#### `user_online`
Un utilisateur est en ligne
```javascript
socket.on('user_online', (data) => {
  console.log('User online:', data.user_id);
});
```

#### `user_offline`
Un utilisateur est hors ligne
```javascript
socket.on('user_offline', (data) => {
  console.log('User offline:', data.user_id);
});
```

#### `user_typing`
Un utilisateur tape un message
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.user_id);
});
```

#### `user_stop_typing`
Un utilisateur a arrêté de taper
```javascript
socket.on('user_stop_typing', (data) => {
  console.log('User stop typing:', data.user_id);
});
```

#### `notification`
Notification générale
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

## 🎨 Composants React

### `<Messaging />`
Composant principal de la messagerie
```jsx
import Messaging from './pages/Messaging';

// Dans votre router
<Route path="/messages" element={<Messaging />} />
```

**Props**: Aucune (récupère le token du localStorage)

### `<ConversationList />`
Liste des conversations
```jsx
<ConversationList 
  conversations={conversations}
  selectedConversation={selectedConversation}
  onSelectConversation={handleSelectConversation}
  onlineUsers={onlineUsers}
/>
```

### `<ChatBox />`
Boîte de chat pour une conversation
```jsx
<ChatBox 
  conversation={conversation}
  socket={socket}
  onlineUsers={onlineUsers}
  onRefresh={fetchConversations}
/>
```

### `<SearchUsers />`
Composant de recherche d'utilisateurs
```jsx
<SearchUsers 
  onSelectUser={handleSelectUser}
  onClose={handleClose}
/>
```

## 🪝 Hooks Personnalisés

### `useMessagingBadge`
Hook pour obtenir le nombre de messages non lus
```jsx
import useMessagingBadge from './hooks/useMessagingBadge';

function App() {
  const { unreadCount, socket } = useMessagingBadge();
  
  return (
    <div>
      <span className="badge">Messages ({unreadCount})</span>
    </div>
  );
}
```

## 🔐 Authentification

Tous les endpoints REST et WebSocket nécessitent un JWT token valide.

### Configuration du Token
1. Le token est stocké dans `localStorage.getItem('token')`
2. Il est automatiquement inclus dans les en-têtes `Authorization: Bearer <token>`
3. Pour WebSocket : `socket = io(url, { auth: { token } })`

## 🎯 Fonctionnalités Principales

✅ **Conversations Directes** - Messagerie 1-à-1
✅ **Conversations de Groupe** - Chat de classe (optionnel)
✅ **Temps Réel** - Socket.io pour les mises à jour instantanées
✅ **Statut en Ligne** - Voir qui est en ligne/offline
✅ **Indicateur de Lecture** - ✓ = envoyé, ✓✓ = lu
✅ **Indicateur de Saisie** - "User is typing..."
✅ **Recherche d'Utilisateurs** - Trouver des utilisateurs rapidement
✅ **Pagination** - Charger les anciens messages
✅ **Badge de Notifications** - Nombre de messages non lus
✅ **Horodatage** - Date/heure pour chaque message
✅ **Interface Moderne** - Design fluide et réactif

## 🐛 Dépannage

### Problème: Impossible de se connecter au socket
**Solution**: Vérifier que le service Messagerie est démarré sur le port 3001

### Problème: Les messages ne s'affichent pas
**Solution**: Vérifier que le token JWT est valide et présent dans localStorage

### Problème: Base de données non synchronisée
**Solution**: Vérifier que PostgreSQL est en cours d'exécution et les variables .env sont correctes

### Problème: CORS errors
**Solution**: Vérifier que `FRONTEND_URL` dans .env correspond à votre URL frontend

## 📚 Exemples d'Utilisation

### Intégrer le badge Messages dans le menu
```jsx
import useMessagingBadge from './hooks/useMessagingBadge';
import { Link } from 'react-router-dom';

function Navigation() {
  const { unreadCount } = useMessagingBadge();
  
  return (
    <nav>
      <Link to="/messages">
        Messages {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </Link>
    </nav>
  );
}
```

### Utiliser la page Messaging
```jsx
// Dans App.jsx ou votre router
import Messaging from './pages/Messaging';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/messages" element={<Messaging />} />
        {/* Autres routes */}
      </Routes>
    </Router>
  );
}
```

## 📈 Performance & Optimisations

- **Pagination**: Les messages sont chargés par lots de 30
- **Virtualisation**: Pour les grandes listes de conversations
- **Compression**: Les messages sont compressés dans les WebSocket
- **Reconnexion Automatique**: En cas de déconnexion
- **Caching**: Les conversations sont mises en cache localement

## 🚀 Déploiement

### Production

1. **Variables d'environnement** (.env)
```env
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=your-secure-secret
FRONTEND_URL=https://yourdomain.com
```

2. **Démarrer le service**
```bash
NODE_ENV=production npm start
```

3. **Nginx Configuration** (exemple)
```nginx
server {
  listen 80;
  server_name messaging.yourdomain.com;
  
  location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 📞 Support

Pour toute question ou problème, consulter la documentation ou contacter l'équipe de développement.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 18 Novembre 2024
