/**
 * Example: How to Use DragDropSchedule Component
 * 
 * This file shows different ways to integrate the drag-and-drop calendar
 * into your existing application.
 */

// ============================================================
// EXAMPLE 1: Basic Usage in Admin Panel
// ============================================================

import React from 'react';
import DragDropSchedule from './components/DragDropSchedule';

export function AdminCalendarPage() {
  const classeId = 1; // From props or URL params
  
  return (
    <div className="admin-calendar-container">
      <h1>📅 Gestion du Calendrier</h1>
      <DragDropSchedule 
        classeId={classeId} 
        className="Classe 1A" 
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 2: With State Management
// ============================================================

import React, { useState } from 'react';
import DragDropSchedule from './components/DragDropSchedule';

export function CalendarWithFilters() {
  const [selectedClass, setSelectedClass] = useState(1);
  const [viewMode, setViewMode] = useState('drag-drop'); // or 'read-only'

  return (
    <div className="calendar-wrapper">
      <div className="controls">
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value={1}>Classe 1A</option>
          <option value={2}>Classe 1B</option>
          <option value={3}>Classe 2A</option>
        </select>

        <button 
          className={viewMode === 'drag-drop' ? 'active' : ''}
          onClick={() => setViewMode('drag-drop')}
        >
          ✏️ Éditable
        </button>
        <button 
          className={viewMode === 'read-only' ? 'active' : ''}
          onClick={() => setViewMode('read-only')}
        >
          👁️ Lecture seule
        </button>
      </div>

      {viewMode === 'drag-drop' && (
        <DragDropSchedule 
          classeId={selectedClass} 
          className={`Classe ${selectedClass}`}
        />
      )}
    </div>
  );
}

// ============================================================
// EXAMPLE 3: With Error Boundary
// ============================================================

import React from 'react';
import DragDropSchedule from './components/DragDropSchedule';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Calendar error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>❌ Erreur lors du chargement du calendrier</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function SafeCalendar() {
  return (
    <ErrorBoundary>
      <DragDropSchedule classeId={1} className="Classe 1A" />
    </ErrorBoundary>
  );
}

// ============================================================
// EXAMPLE 4: Integration with Existing Components
// ============================================================

import React, { useState, useEffect } from 'react';
import DragDropSchedule from './components/DragDropSchedule';
import { CalendarAPI } from './services/CalendarAPI';

export function AdvancedCalendarPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [stats, setStats] = useState({});
  const api = new CalendarAPI();

  useEffect(() => {
    // Fetch available classes
    const fetchClasses = async () => {
      try {
        // Assuming you have an endpoint to fetch classes
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClassId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, []);

  const updateStats = async () => {
    try {
      const schedules = await api.getSchedules({ 
        classe_id: selectedClassId 
      });
      setStats({
        total: schedules.length,
        confirmed: schedules.filter(s => s.statut === 'confirme').length,
        cancelled: schedules.filter(s => s.statut === 'annule').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!selectedClassId) {
    return <div>Chargement des classes...</div>;
  }

  return (
    <div className="advanced-calendar">
      <header className="calendar-header">
        <h1>📅 Gestion Avancée du Calendrier</h1>
        
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Confirmé</span>
            <span className="stat-value">{stats.confirmed || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Annulé</span>
            <span className="stat-value">{stats.cancelled || 0}</span>
          </div>
        </div>
      </header>

      <div className="class-selector">
        <label>Sélectionner une classe:</label>
        <select 
          value={selectedClassId} 
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.niveau})
            </option>
          ))}
        </select>
      </div>

      <div className="calendar-container">
        <DragDropSchedule 
          classeId={selectedClassId}
          className={classes.find(c => c.id === selectedClassId)?.name}
        />
      </div>

      <footer className="calendar-footer">
        <button onClick={updateStats}>Actualiser les statistiques</button>
      </footer>
    </div>
  );
}

// ============================================================
// EXAMPLE 5: Keyboard Shortcut Support
// ============================================================

import React, { useEffect } from 'react';
import DragDropSchedule from './components/DragDropSchedule';

export function CalendarWithShortcuts() {
  const [classeId, setClasseId] = useState(1);

  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ctrl+Left Arrow: Previous class
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        setClasseId(prev => Math.max(1, prev - 1));
      }
      // Ctrl+Right Arrow: Next class
      if (e.ctrlKey && e.key === 'ArrowRight') {
        setClasseId(prev => prev + 1);
      }
      // Ctrl+R: Refresh
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        // Trigger refresh
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  return (
    <div className="calendar-with-shortcuts">
      <div className="keyboard-hints">
        <p>💡 Raccourcis clavier:</p>
        <ul>
          <li>Ctrl + ← : Classe précédente</li>
          <li>Ctrl + → : Classe suivante</li>
          <li>Ctrl + R : Actualiser</li>
        </ul>
      </div>

      <DragDropSchedule 
        classeId={classeId}
        className={`Classe ${classeId}`}
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 6: Mobile-Optimized Version
// ============================================================

import React, { useState } from 'react';
import DragDropSchedule from './components/DragDropSchedule';

export function MobileCalendar() {
  const [classeId, setClasseId] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="mobile-calendar">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          ☰
        </button>
        <h1>📅 Planning</h1>
        <button className="info-btn">ℹ️</button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="mobile-menu">
          <select 
            value={classeId}
            onChange={(e) => {
              setClasseId(e.target.value);
              setShowMenu(false);
            }}
            className="class-selector"
          >
            <option value={1}>Classe 1A</option>
            <option value={2}>Classe 1B</option>
            <option value={3}>Classe 2A</option>
          </select>
        </div>
      )}

      {/* Calendar */}
      <DragDropSchedule 
        classeId={classeId}
        className={`Classe ${classeId}`}
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 7: Export Scheduled Data
// ============================================================

import React from 'react';
import DragDropSchedule from './components/DragDropSchedule';
import { CalendarAPI } from './services/CalendarAPI';

export function CalendarWithExport() {
  const [classeId, setClasseId] = useState(1);
  const api = new CalendarAPI();

  const exportToCSV = async () => {
    try {
      const schedules = await api.getSchedules({ classe_id: classeId });
      
      let csv = 'Jour,Heure Début,Heure Fin,Matière,Salle,Statut\n';
      schedules.forEach(s => {
        csv += `${s.timeSlot.day_of_week},${s.timeSlot.start_time},${s.timeSlot.end_time},${s.matiere.name},${s.salle?.nom || 'N/A'},${s.statut}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning-classe-${classeId}.csv`;
      a.click();
      
      alert('✅ Planning exporté avec succès!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('❌ Erreur lors de l\'export');
    }
  };

  return (
    <div className="calendar-with-export">
      <div className="export-controls">
        <button onClick={exportToCSV} className="export-btn">
          📥 Exporter en CSV
        </button>
      </div>

      <DragDropSchedule 
        classeId={classeId}
        className={`Classe ${classeId}`}
      />
    </div>
  );
}

export default DragDropSchedule;
