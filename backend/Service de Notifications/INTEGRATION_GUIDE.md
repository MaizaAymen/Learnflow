# Notifications Service - Integration Guide

## 📌 Intégration avec d'autres services

Ce guide explique comment intégrer le NotificationService dans les autres microservices.

---

## 🔗 1. Intégration avec le Service Événements

### Fichier: `backend/Gestion des Événements/server.js`

Ajouter l'import:
```javascript
const axios = require('axios');
const NOTIFICATIONS_SERVICE = 'http://localhost:3005';
```

Exporter les fonctions d'événements:
```javascript
// Exporter pour accès depuis les routes
module.exports = { app, server, notificationService: NOTIFICATIONS_SERVICE };
```

### Fichier: `backend/Gestion des Événements/routes/events.js`

Dans la route POST pour créer un événement:
```javascript
router.post('/', async (req, res) => {
  try {
    // ... créer l'événement ...
    const event = await Event.create({...});
    
    // Notifier les étudiants
    try {
      await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/events`, {
        type: 'event.created',
        data: {
          event_id: event.id,
          title: event.title,
          class_id: event.class_id,
          student_ids: event.student_ids || [],
          event_creator_id: event.created_by
        }
      });
    } catch (notifyError) {
      console.warn('⚠️ Notification service unavailable:', notifyError.message);
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Pour l'enregistrement à un événement:
```javascript
router.post('/:eventId/register', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { student_id } = req.body;
    
    // ... enregistrer l'étudiant ...
    const registration = await EventRegistration.create({...});
    
    // Notifier le créateur
    try {
      const event = await Event.findByPk(eventId);
      await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/events`, {
        type: 'event.registered',
        data: {
          event_id: eventId,
          student_id: student_id,
          event_creator_id: event.created_by,
          event_title: event.title
        }
      });
    } catch (notifyError) {
      console.warn('⚠️ Notification service unavailable:', notifyError.message);
    }
    
    res.json(registration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔗 2. Intégration avec le Service Référence

### Fichier: `backend/Reference_documents/routes/Students.js`

Pour l'enregistrement d'absence:
```javascript
const axios = require('axios');
const NOTIFICATIONS_SERVICE = 'http://localhost:3005';

router.post('/absences/register', async (req, res) => {
  try {
    const { student_id, course_name, date } = req.body;
    
    // ... créer l'absence ...
    const absence = await StudentAbsence.create({...});
    
    // Notifier l'étudiant
    try {
      await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/reference`, {
        type: 'absence.registered',
        data: {
          absence_id: absence.id,
          student_id: student_id,
          course_name: course_name,
          date: date
        }
      });
    } catch (notifyError) {
      console.warn('⚠️ Notification service unavailable:', notifyError.message);
    }
    
    res.json(absence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Pour les alertes de risque d'élimination:
```javascript
router.post('/check-elimination-risk', async (req, res) => {
  try {
    const { student_id, department_id } = req.body;
    
    // ... vérifier les risques ...
    const absenceCount = await StudentAbsence.count({
      where: { student_id }
    });
    
    if (absenceCount >= 10) {
      // Notifier l'étudiant et le chef
      try {
        const departmentHead = await User.findOne({
          where: { role: 'department_head', department_id }
        });
        
        await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/reference`, {
          type: 'student.elimination_risk',
          data: {
            student_id: student_id,
            risk_level: 'high',
            absence_count: absenceCount,
            reason: `${absenceCount} absences enregistrées`,
            department_head_id: departmentHead?.id
          }
        });
      } catch (notifyError) {
        console.warn('⚠️ Notification service unavailable:', notifyError.message);
      }
    }
    
    res.json({ risk: absenceCount >= 10 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Pour les changements d'emploi du temps:
```javascript
router.put('/schedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { new_time, course_name } = req.body;
    
    // ... récupérer l'ancien emploi du temps ...
    const schedule = await Schedule.findByPk(scheduleId);
    const oldTime = schedule.time;
    
    // ... mettre à jour ...
    await schedule.update({ time: new_time });
    
    // Notifier les étudiants
    try {
      const classe = await Classe.findByPk(schedule.class_id);
      const students = await classe.getStudents();
      
      await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/reference`, {
        type: 'schedule.changed',
        data: {
          schedule_id: scheduleId,
          class_id: classe.id,
          student_ids: students.map(s => s.id),
          old_time: oldTime,
          new_time: new_time,
          course_name: course_name
        }
      });
    } catch (notifyError) {
      console.warn('⚠️ Notification service unavailable:', notifyError.message);
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔗 3. Intégration avec le Service Messagerie

### Fichier: `backend/Messagerie/routes/messaging.js`

```javascript
const axios = require('axios');
const NOTIFICATIONS_SERVICE = 'http://localhost:3005';

router.post('/messages', async (req, res) => {
  try {
    const { conversation_id, sender_id, content } = req.body;
    
    // ... créer le message ...
    const message = await Message.create({
      conversation_id,
      sender_id,
      content
    });
    
    // Récupérer les participants
    const participants = await ConversationParticipant.findAll({
      where: { conversation_id }
    });
    
    // Notifier chaque destinataire
    for (const participant of participants) {
      if (participant.user_id !== sender_id) {
        try {
          const sender = await User.findByPk(sender_id);
          
          await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/messaging`, {
            type: 'message.received',
            data: {
              message_id: message.id,
              recipient_id: participant.user_id,
              sender_name: `${sender.nom} ${sender.prenom}`,
              message_preview: content.substring(0, 100)
            }
          });
        } catch (notifyError) {
          console.warn('⚠️ Notification service unavailable:', notifyError.message);
        }
      }
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔗 4. Intégration avec le Service Auth

### Fichier: `backend/auth-service/routes/authRoutes.js`

```javascript
const axios = require('axios');
const NOTIFICATIONS_SERVICE = 'http://localhost:3005';

router.post('/register', async (req, res) => {
  try {
    const { nom, prenom, email, numero_etudiant } = req.body;
    
    // Générer un mot de passe temporaire
    const tempPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // ... créer l'utilisateur ...
    const user = await User.create({
      nom,
      prenom,
      email,
      numero_etudiant,
      mdp_hash: hashedPassword,
      // ...
    });
    
    // Notifier l'utilisateur
    try {
      await axios.post(`${NOTIFICATIONS_SERVICE}/api/webhooks/auth`, {
        type: 'account.created',
        data: {
          user_id: user.id,
          temp_password: tempPassword,
          email: user.email,
          user_name: `${user.nom} ${user.prenom}`
        }
      });
    } catch (notifyError) {
      console.warn('⚠️ Notification service unavailable:', notifyError.message);
    }
    
    // Envoyer l'email avec le mot de passe temporaire
    // ... code d'envoi d'email ...
    
    res.json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📦 Configuration des dépendances

Ajouter à chaque `package.json` du service:
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

Puis installer:
```bash
npm install axios
```

---

## 🧪 Tests des Webhooks

### Test avec curl

```bash
# Test événement créé
curl -X POST http://localhost:3005/api/webhooks/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event.created",
    "data": {
      "event_id": "evt-123",
      "title": "Réunion de classe",
      "class_id": "cls-456",
      "student_ids": [1, 2, 3],
      "event_creator_id": 5
    }
  }'

# Test absence enregistrée
curl -X POST http://localhost:3005/api/webhooks/reference \
  -H "Content-Type: application/json" \
  -d '{
    "type": "absence.registered",
    "data": {
      "absence_id": "abs-123",
      "student_id": 123,
      "course_name": "Mathématiques",
      "date": "2024-01-15"
    }
  }'

# Test message reçu
curl -X POST http://localhost:3005/api/webhooks/messaging \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message.received",
    "data": {
      "message_id": "msg-123",
      "recipient_id": 123,
      "sender_name": "Jean Dupont",
      "message_preview": "Bonjour, comment ça va?"
    }
  }'
```

---

## ✅ Checklist d'intégration

- [ ] Ajouter `axios` aux dépendances
- [ ] Importer `axios` dans les routes
- [ ] Ajouter l'URL du service de notifications
- [ ] Appeler le webhook après chaque action pertinente
- [ ] Entourer les appels dans try-catch
- [ ] Tester avec curl
- [ ] Vérifier les notifications reçues via GET /api/notifications
- [ ] Vérifier les logs dans le service de notifications

---

## 🆘 Dépannage

**Q: "axios is not defined"**
A: Assurez-vous d'avoir importé axios en haut du fichier

**Q: Erreur "ECONNREFUSED"**
A: Vérifiez que le service de notifications est en cours d'exécution sur le port 3005

**Q: Les notifications ne s'affichent pas**
A: Vérifiez que l'utilisateur existe dans la BD et qu'il a un ID valide

---

## 📚 Références

- [README.md](./README.md) - Documentation complète du service
- [NotificationService.js](./services/NotificationService.js) - Logique métier
- [notifications.js routes](./routes/notifications.js) - API notifications
- [preferences.js routes](./routes/preferences.js) - Gestion des préférences

