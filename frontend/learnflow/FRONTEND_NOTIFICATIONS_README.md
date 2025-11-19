# Frontend - Notifications Integration Guide

## 📱 Intégration du Service de Notifications en Frontend

### 🎯 Vue d'ensemble

Le service de notifications a été intégré dans le frontend React avec :
- Context API pour la gestion d'état
- Hook personnalisé `useNotifications()`
- Composant `NotificationBell` pour la cloche de notifications
- Page complète `NotificationsCenter` pour gérer toutes les notifications et les préférences

---

## 📦 Fichiers créés

### 1. **services/NotificationAPI.js**
Service API pour communiquer avec le backend de notifications

**Méthodes principales :**
```javascript
NotificationAPI.getNotifications(page, limit, unreadOnly)
NotificationAPI.getUnreadCount()
NotificationAPI.markAsRead(id)
NotificationAPI.markAllAsRead()
NotificationAPI.deleteNotification(id)
NotificationAPI.deleteMultiple(ids)
NotificationAPI.getPreferences()
NotificationAPI.updatePreferences(preferences)
NotificationAPI.toggleNotificationType(type, enabled)
NotificationAPI.setQuietHours(startTime, endTime)
```

### 2. **hooks/useNotifications.jsx**
Hook React avec Context pour gérer les notifications

**Features :**
- ✅ Auto-refresh toutes les 30 secondes
- ✅ Gestion d'état avec useReducer
- ✅ Récupération automatique au démarrage
- ✅ Actions pour marquer comme lu, supprimer, etc.

**Utilisation :**
```javascript
const { 
  notifications,
  unreadCount,
  preferences,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // ... plus de méthodes
} = useNotifications();
```

### 3. **components/NotificationBell.jsx**
Composant cloche de notifications dans le header

**Features :**
- 🔔 Badge avec le nombre de non-lues
- 📬 Dropdown avec dernières notifications
- ✅ Bouton "Mark all read"
- 🗑️ Supprimer individuellement
- 🎨 Priorité par couleur

### 4. **components/NotificationBell.css**
Styles du composant cloche

### 5. **pages/NotificationsCenter.jsx**
Page complète de gestion des notifications

**Onglets :**
- 📬 **Notifications** : Toutes les notifications avec filtres
- ⚙️ **Preferences** : Configuration des notifications

**Features :**
- ✅ Pagination
- ✅ Sélection multiple (select all / batch delete)
- ✅ Toggler par type de notification
- ✅ Gestion des heures calmes
- ✅ Configuration email/SMS

### 6. **pages/NotificationsCenter.css**
Styles de la page

---

## 🚀 Installation et Configuration

### 1. Ajouter le Provider dans App.jsx

Le provider est déjà intégré. Voici la structure :

```jsx
import { NotificationProvider } from './hooks/useNotifications.jsx';
import NotificationsCenter from './pages/NotificationsCenter.jsx';

function App() {
  return (
    <NotificationProvider>
      {/* Votre application */}
    </NotificationProvider>
  );
}
```

### 2. Utiliser le Hook dans un composant

```jsx
import { useNotifications } from '../hooks/useNotifications';

export function MonComposant() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <p>Non-lues: {unreadCount}</p>
      {notifications.map(notif => (
        <div key={notif.id}>
          <h4>{notif.title}</h4>
          <p>{notif.content}</p>
          <button onClick={() => markAsRead(notif.id)}>Marquer comme lu</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Cloche de notifications dans le Header

La cloche a été intégrée dans `Layout.jsx` et s'affiche dans le header :

```jsx
import NotificationBell from './NotificationBell';

// Dans le header :
<Link to="/notifications" title="View all notifications">
  <NotificationBell />
</Link>
```

---

## 📖 Exemples d'utilisation

### Exemple 1 : Afficher le nombre de notifications non-lues

```jsx
import { useNotifications } from '../hooks/useNotifications';

export function NotificationCounter() {
  const { unreadCount } = useNotifications();

  return (
    <div className="counter">
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </div>
  );
}
```

### Exemple 2 : Marquer toutes les notifications comme lues

```jsx
import { useNotifications } from '../hooks/useNotifications';

export function ClearAllButton() {
  const { markAllAsRead } = useNotifications();

  return (
    <button onClick={markAllAsRead}>
      ✓ Marquer tout comme lu
    </button>
  );
}
```

### Exemple 3 : Afficher la liste des notifications non-lues

```jsx
import { useNotifications } from '../hooks/useNotifications';

export function UnreadList() {
  const { notifications } = useNotifications();

  const unread = notifications.filter(n => !n.is_read);

  return (
    <ul>
      {unread.map(notif => (
        <li key={notif.id}>{notif.title}</li>
      ))}
    </ul>
  );
}
```

### Exemple 4 : Gérer les préférences

```jsx
import { useNotifications } from '../hooks/useNotifications';

export function PreferencesPanel() {
  const { preferences, toggleNotificationType } = useNotifications();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences?.event_created || false}
          onChange={(e) => toggleNotificationType('event_created', e.target.checked)}
        />
        Recevoir les notifications d'événements
      </label>
    </div>
  );
}
```

---

## 🔄 Flux de données

```
Backend (Notifications Service)
    ↓ (API)
Frontend (NotificationAPI.js)
    ↓ (fetch)
React Context (useNotifications.jsx)
    ↓ (state)
Components (NotificationBell, NotificationsCenter)
    ↓ (display)
User Interface
```

---

## 🎨 Customisation

### Modifier les couleurs par priorité

Dans `NotificationBell.css` et `NotificationsCenter.css` :

```css
.notification-card.priority-critical {
  border-left: 4px solid #ff4444; /* Couleur critique */
}

.notification-card.priority-high {
  border-left: 4px solid #ff9500; /* Couleur haute */
}
```

### Ajouter des icônes personnalisées

Dans `NotificationsCenter.jsx` :

```javascript
const getNotificationIcon = (type) => {
  const icons = {
    'event_created': '📅',
    'your_type': '🎉', // Ajouter votre type
  };
  return icons[type] || '📌';
};
```

### Modifier le refresh interval

Dans `useNotifications.jsx`, ligne ~160 :

```javascript
const interval = setInterval(() => {
  fetchUnreadCount();
}, 30000); // Changer 30000 en votre valeur (ms)
```

---

## 🧪 Tests

### Tester avec la cloche de notifications

1. Allez sur `/notifications` page
2. Utilisez l'endpoint admin pour créer une notification de test :
```bash
curl -X POST http://localhost:3005/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 1,
    "type": "event_created",
    "title": "Test Notification",
    "content": "Ceci est une notification de test"
  }'
```

3. Vous devriez voir la notification :
   - Dans la cloche (badge+1)
   - Dans le dropdown de la cloche
   - Dans la page `/notifications`

### Tester les webhooks

Le backend envoie des notifications via webhooks. Pour tester localement :

```bash
# Test depuis le service de notifications
curl -X POST http://localhost:3005/api/webhooks/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event.created",
    "data": {
      "event_id": "evt-123",
      "title": "Test Event",
      "class_id": "cls-123",
      "student_ids": [1, 2, 3],
      "event_creator_id": 5
    }
  }'
```

---

## 🔐 Authentification

Les appels API utilisent `credentials: 'include'` pour envoyer les cookies d'authentification.

Assurez-vous que votre serveur backend accepte les cookies CORS :

```javascript
// Dans server.js du backend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📱 Responsive Design

Le design est responsive et fonctionne sur :
- 💻 Desktop (1200px+)
- 📱 Tablette (768px-1199px)
- 📱 Mobile (480px-767px)

Les breakpoints sont définis dans les fichiers CSS.

---

## ⚠️ Dépannage

### Les notifications ne s'affichent pas

1. Vérifiez que le service de notifications est en cours d'exécution sur le port 3005
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que l'utilisateur existe en base de données

### La cloche de notifications est vide

1. Créez une notification de test via l'endpoint admin
2. Vérifiez que le hook `useNotifications` est utilisé dans le composant

### Auto-refresh ne fonctionne pas

1. Vérifiez que le backend est accessible
2. Vérifiez les logs de la console du navigateur
3. Vérifiez que `autoRefresh` est activé

### CORS Error

Assurez-vous que :
1. Le backend envoie les headers CORS corrects
2. `credentials: 'include'` est utilisé dans les appels fetch
3. L'URL du backend est correcte

---

## 📚 Structure des données

### Notification Object
```json
{
  "id": "uuid",
  "recipient_id": 123,
  "type": "event_created|event_registered|absence_registered|...",
  "title": "Titre de la notification",
  "content": "Contenu détaillé",
  "metadata": {
    "event_id": "uuid",
    "class_id": "uuid"
  },
  "is_read": false,
  "read_at": null,
  "priority": "low|medium|high|critical",
  "action_url": "/path/to/resource",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Preferences Object
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
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00"
}
```

---

## 🔗 Routes disponibles

| Route | Description |
|-------|-------------|
| `/notifications` | Page complète de gestion des notifications |
| `/` | Home page (affiche la cloche dans le header) |

---

## 📝 Notes

- Le service de notifications se connecte automatiquement au démarrage de l'app
- Les notifications sont auto-actualisées toutes les 30 secondes
- Les notifications résolues (lues/supprimées) sont immédiatement mises à jour
- Les préférences sont sauvegardées sur le serveur

---

## 🆘 Support

Pour plus d'informations, consultez :
- [Backend README](../../backend/Service%20de%20Notifications/README.md)
- [Integration Guide](../../backend/Service%20de%20Notifications/INTEGRATION_GUIDE.md)
- [Testing Examples](../../backend/Service%20de%20Notifications/TESTING_EXAMPLES.sh)
