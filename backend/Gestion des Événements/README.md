# Service de Gestion des Événements

Service microservice permettant de créer, modifier, supprimer et lister des événements universitaires.

Endpoints principaux:
- `POST /api/events` : créer un événement
- `GET /api/events` : lister les événements (filtres: `type`, `departement_id`, `visibility`)
- `GET /api/events/:id` : récupérer un événement
- `PUT /api/events/:id` : modifier un événement
- `DELETE /api/events/:id` : supprimer un événement

Démarrage:
```powershell
cd "backend/Gestion des Événements"
npm install
npm start
```

Le service utilise la même base de données et le même `sequelize` exporté par `auth-service/config`.
