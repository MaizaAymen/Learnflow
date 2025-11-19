/**
 * EXEMPLE D'INTÉGRATION - Messagerie Interne
 * 
 * Ce fichier montre comment intégrer la messagerie dans votre application React
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ============================================================================
// IMPORTS DES PAGES ET COMPOSANTS
// ============================================================================

// Messagerie
import Messaging from './pages/Messaging';

// Hooks
import useMessagingBadge from './hooks/useMessagingBadge';

// Autres pages...
// import Home from './pages/Home';
// import Dashboard from './pages/Dashboard';

// ============================================================================
// NAVIGATION AVEC BADGE MESSAGERIE
// ============================================================================

function Navigation() {
  const { unreadCount } = useMessagingBadge();

  return (
    <nav className="app-navigation">
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/messages" className="nav-messages">
          Messages
          {unreadCount > 0 && (
            <span className="message-badge">{unreadCount}</span>
          )}
        </a>
      </div>
    </nav>
  );
}

// ============================================================================
// APPLICATION PRINCIPALE
// ============================================================================

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />

        <main className="app-content">
          <Routes>
            {/* Route pour la messagerie */}
            <Route path="/messages" element={<Messaging />} />

            {/* Autres routes */}
            {/* <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} /> */}

            {/* Route 404 */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

// ============================================================================
// STYLES CSS (à ajouter dans votre fichier global ou App.css)
// ============================================================================

/*

.app-navigation {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-links {
  display: flex;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-links a {
  padding: 12px 0;
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-links a:hover {
  color: #3b82f6;
}

.nav-messages {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-badge {
  background: #ef4444;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-content {
  flex: 1;
  overflow: auto;
}

*/

// ============================================================================
// NOTES D'INTÉGRATION
// ============================================================================

/*

1. LOCALISATION DU TOKEN JWT
   - Le token doit être stocké dans localStorage avec la clé 'token'
   - Assurez-vous que votre système d'authentification le définit correctement
   - localStorage.setItem('token', jwtToken);

2. LOCALISATION DE L'UTILISATEUR
   - L'utilisateur courant doit être stocké dans localStorage avec la clé 'user'
   - Format: { id, nom, prenom, email, role }
   - localStorage.setItem('user', JSON.stringify(userData));

3. VARIABLES D'ENVIRONNEMENT (.env)
   REACT_APP_MESSAGING_URL=http://localhost:3001
   REACT_APP_API_URL=http://localhost:3000

4. INSTALLATION DES DÉPENDANCES
   npm install socket.io-client

5. DÉMARRAGE DU SERVICE MESSAGERIE
   cd backend/Messagerie
   npm install
   npm start

6. VÉRIFICATION
   - Ouvrir http://localhost:3001/health
   - Console de votre navigateur: pas d'erreurs
   - WebSocket connecté dans les DevTools

7. PERSONNALISATION
   - Modifier les styles dans src/pages/Messaging.scss
   - Ajouter des hooks personnalisés au besoin
   - Intégrer les notifications (email, push, etc.)

*/
