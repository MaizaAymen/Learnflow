# 🚀 Guide de Démarrage Rapide - Messagerie Interne

## ⏱️ Résumé (5 minutes)

Voici les étapes essentielles pour mettre en place la messagerie interne.

## 1️⃣ Backend - Service Messagerie

### Installation
```bash
cd backend/Messagerie
npm install
```

### Configuration
Créer/mettre à jour `.env`:
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

### Démarrer le service
```bash
npm start
```

✅ Le service démarre sur `http://localhost:3001`

## 2️⃣ Frontend - Intégration React

### Installation
```bash
cd frontend/learnflow
npm install socket.io-client
```

### Ajouter la route
Dans `src/App.jsx` ou votre router:
```jsx
import Messaging from './pages/Messaging';

// Dans vos routes:
<Route path="/messages" element={<Messaging />} />
```

### Ajouter le badge Messages (optionnel)
Dans votre Navigation/Header:
```jsx
import useMessagingBadge from './hooks/useMessagingBadge';
import { Link } from 'react-router-dom';

function Navigation() {
  const { unreadCount } = useMessagingBadge();
  
  return (
    <Link to="/messages">
      Messages {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </Link>
  );
}
```

## 3️⃣ Accéder à la Messagerie

1. Se connecter à votre application
2. Accéder à `/messages`
3. Cliquer sur le bouton "✎" pour démarrer une nouvelle conversation
4. Rechercher l'utilisateur par nom ou email
5. Commencer à discuter! 💬

## 📊 Architecture Récapitulatif

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  Messaging.jsx + Components         │
│  - ConversationList                 │
│  - ChatBox                          │
│  - SearchUsers                      │
└────────────┬────────────────────────┘
             │ Socket.io + REST API
             ↓
┌─────────────────────────────────────┐
│    Messagerie Service (Express)     │
│  Port: 3001                         │
│  - WebSocket (Socket.io)            │
│  - REST API (/api/messaging)        │
│  - Authentication (JWT)             │
└────────────┬────────────────────────┘
             │ Sequelize ORM
             ↓
┌─────────────────────────────────────┐
│   PostgreSQL (shared database)      │
│  - conversations                    │
│  - messages                         │
│  - conversation_participants        │
│  - user_online_status              │
└─────────────────────────────────────┘
```

## 📂 Structure des Fichiers Créés

```
backend/Messagerie/
├── config/database.js
├── models/
│   ├── Message.js
│   ├── Conversation.js
│   ├── ConversationParticipant.js
│   ├── UserOnlineStatus.js
│   └── index.js
├── routes/messaging.js
├── services/MessagingService.js
├── middleware/auth.js
├── server.js
├── package.json
├── .env
└── README.md

frontend/learnflow/src/
├── pages/
│   ├── Messaging.jsx
│   ├── Messaging.scss
│   └── components/
│       ├── ConversationList.jsx
│       ├── ConversationList.scss
│       ├── ChatBox.jsx
│       ├── ChatBox.scss
│       ├── SearchUsers.jsx
│       └── SearchUsers.scss
└── hooks/
    └── useMessagingBadge.js
```

## ✅ Checklist de Vérification

- [ ] Service Messagerie démarré sur port 3001
- [ ] PostgreSQL en cours d'exécution
- [ ] Token JWT dans localStorage
- [ ] Route `/messages` accessible
- [ ] Socket.io connecté avec succès
- [ ] Recherche d'utilisateurs fonctionnelle
- [ ] Messages envoyés et reçus en temps réel
- [ ] Badge de notifications affichant les messages non lus
- [ ] Statut en ligne/offline visible

## 🔍 Test Rapide

### Via cURL (REST API)
```bash
# Récupérer les conversations
curl -X GET http://localhost:3001/api/messaging/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Chercher un utilisateur
curl -X GET "http://localhost:3001/api/messaging/search-users?query=Ahmed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtenir les messages non lus
curl -X GET http://localhost:3001/api/messaging/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Via Console JavaScript
```javascript
// Vérifier la connexion Socket
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('✅ Socket connecté');
});

socket.on('new_message', (message) => {
  console.log('📨 Nouveau message:', message);
});
```

## 🎯 Cas d'Utilisation

### Scénario 1: Étudiant contact un enseignant
1. Étudiant accède à `/messages`
2. Clique sur "✎" (nouvelle conversation)
3. Recherche l'enseignant par nom
4. Sélectionne l'enseignant
5. Tape et envoie le message
6. L'enseignant reçoit une notification en temps réel

### Scénario 2: Notification de message non lu
1. Admin envoie un message
2. Badge affiche "Messages (1)"
3. Utilisateur voit le nombre de messages non lus
4. Clique sur Messages pour voir les conversations
5. Conversation avec badge rouge apparaît

### Scénario 3: Voir qui est en ligne
1. Ouvrir une conversation
2. En haut: "🟢 Online" ou "🔴 Offline"
3. Le statut se met à jour en temps réel

## 🚨 Problèmes Courants & Solutions

### Erreur: "Cannot POST /api/messaging/messages"
**Cause**: Service Messagerie ne tourne pas
**Solution**: `npm start` dans `backend/Messagerie/`

### Erreur: "Token not provided"
**Cause**: Token JWT manquant dans localStorage
**Solution**: Assurez-vous d'être connecté avant d'accéder à `/messages`

### Erreur: "ECONNREFUSED"
**Cause**: Service Messagerie ne répond pas
**Solution**: Vérifier port 3001 et les logs

### Les messages n'arrivent pas en temps réel
**Cause**: Socket.io non connecté
**Solution**: Vérifier la console pour les erreurs de connexion

## 📱 Fonctionnalités Principales

| Fonctionnalité | Description | État |
|---|---|---|
| Conversations directes | Chat 1-à-1 | ✅ |
| Conversations de groupe | Chat multi-utilisateurs | ✅ |
| Temps réel | WebSocket Socket.io | ✅ |
| Statut en ligne | Voir qui est online | ✅ |
| Indicateur de lecture | ✓/✓✓ | ✅ |
| Indicateur de saisie | "User is typing" | ✅ |
| Recherche utilisateurs | Trouver des contacts | ✅ |
| Pagination | Charger anciens messages | ✅ |
| Badge notifications | Nombre messages non lus | ✅ |
| Horodatage | Date/heure des messages | ✅ |
| UI moderne | Design fluide | ✅ |

## 🔐 Sécurité

- ✅ Authentification JWT requise
- ✅ Validation des permissions (utilisateur ne peut voir que ses conversations)
- ✅ Messages chiffrés en transit (HTTPS en prod)
- ✅ Sanitization des entrées

## 📈 Prochaines Étapes (Optionnel)

- [ ] Ajouter les notifications par email
- [ ] Implémenter les appels audio/vidéo
- [ ] Ajouter la suppression/édition de messages
- [ ] Implémenter les salons groupes auto-créés par classe
- [ ] Ajouter la recherche de messages
- [ ] Implémenter les réactions aux messages (émojis)
- [ ] Ajouter le partage de fichiers
- [ ] Implémenter les messages planifiés

## 📞 Support

Pour toute question ou bug:
1. Consulter le README.md complet
2. Vérifier les logs du service
3. Vérifier la connexion à la BD
4. Vérifier les variables d'environnement

---

**Prêt à discuter? 🎉**  
Accédez maintenant à `/messages` et commencez à converser!
