import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CalendarDashboard.css';

/**
 * Calendar Dashboard - Main navigation for calendar system
 */
const CalendarDashboard = () => {
  const [stats, setStats] = useState({
    totalTimeSlots: 0,
    totalSchedules: 0,
    totalBookings: 0,
    activeClasses: 0
  });

  const menuItems = [
    {
      title: '📚 Calendriers par Classe',
      description: 'Voir le calendrier de chaque classe',
      icon: '📚',
      path: '/calendar/classes',
      color: '#667eea'
    },
    {
      title: '⚡ Créneaux Auto',
      description: 'Générer automatiquement les créneaux horaires',
      icon: '⚡',
      path: '/calendar/timeslots/auto',
      color: '#667eea'
    },
    {
      title: 'Créneaux Horaires',
      description: 'Gérer les créneaux horaires disponibles',
      icon: '🕐',
      path: '/calendar/timeslots',
      color: '#667eea'
    },
    {
      title: 'Planning des Cours',
      description: 'Créer et gérer les plannings de cours',
      icon: '📅',
      path: '/calendar/schedules',
      color: '#764ba2'
    },
    {
      title: '📊 Emploi du Temps Complet',
      description: 'Visualiser les emplois du temps avec détection de conflits',
      icon: '📊',
      path: '/calendar/timetable',
      color: '#667eea'
    },
    {
      title: 'Planning par Classe',
      description: 'Voir le planning hebdomadaire des classes',
      icon: '🏫',
      path: '/calendar/class-schedule',
      color: '#f093fb'
    },
    {
      title: 'Planning Enseignant',
      description: 'Consulter le planning des enseignants',
      icon: '👨‍🏫',
      path: '/calendar/teacher-schedule',
      color: '#4facfe'
    },
    {
      title: 'Réservations',
      description: 'Gérer les inscriptions et réservations',
      icon: '📝',
      path: '/calendar/bookings',
      color: '#43e97b'
    },
    {
      title: 'Présences',
      description: 'Marquer et consulter les présences',
      icon: '✓',
      path: '/calendar/attendance',
      color: '#fa709a'
    },
    {
      title: 'Disponibilité',
      description: 'Vérifier les créneaux disponibles',
      icon: '🔍',
      path: '/calendar/availability',
      color: '#fee140'
    },
    {
      title: 'Rapports',
      description: 'Statistiques et rapports de présence',
      icon: '📊',
      path: '/calendar/reports',
      color: '#30cfd0'
    },
    {
      title: 'Calendrier Événements',
      description: 'Vue mensuelle avec événements et badges',
      icon: '📆',
      path: '/calendar/events',
      color: '#667eea'
    }
  ];

  return (
    <div className="calendar-dashboard">
      <div className="dashboard-header">
        <h1>📅 Système de Calendrier</h1>
        <p>Gestion complète des plannings et des horaires</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-info">
            <h3>{stats.totalTimeSlots}</h3>
            <p>Créneaux Horaires</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalSchedules}</h3>
            <p>Cours Planifiés</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats.totalBookings}</h3>
            <p>Inscriptions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-info">
            <h3>{stats.activeClasses}</h3>
            <p>Classes Actives</p>
          </div>
        </div>
      </div>

      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <Link 
            key={index} 
            to={item.path} 
            className="menu-card"
            style={{ borderColor: item.color }}
          >
            <div className="menu-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="menu-arrow" style={{ color: item.color }}>→</div>
          </Link>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Actions Rapides</h2>
        <div className="action-buttons">
          <Link to="/calendar/classes" className="action-btn primary">
            📚 Calendriers par Classe
          </Link>
          <Link to="/calendar/timeslots/auto" className="action-btn primary">
            ⚡ Créneaux Auto
          </Link>
          <Link to="/calendar/create" className="action-btn primary">
            ➕ Créer un Planning
          </Link>
          <Link to="/calendar/events" className="action-btn info">
            �️ Voir Tous les Calendriers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboard;
