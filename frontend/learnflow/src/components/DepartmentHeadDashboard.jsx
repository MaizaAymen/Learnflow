import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import departmentHeadService from '../services/departmentHeadService';
import './DepartmentHeadDashboard.css';

const DepartmentHeadDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroupes, setFilterGroupes] = useState('');
  const [filterSpecialites, setFilterSpecialites] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  
  // Unique values for filters
  const [groupes, setGroupes] = useState([]);
  const [specialites, setSpecialites] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await departmentHeadService.getStudents(filters);
      setStudents(data);
      
      // Extract unique groupes and specialites
      const uniqueGroupes = [...new Set(data.map(s => s.groupe))];
      const uniqueSpecialites = [...new Set(data.map(s => s.specialite))];
      setGroupes(uniqueGroupes);
      setSpecialites(uniqueSpecialites);
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (filterGroupes) filters.groupe = filterGroupes;
    if (filterSpecialites) filters.specialite = filterSpecialites;
    if (filterStatut) filters.statut = filterStatut;
    
    await fetchStudents(filters);
  };

  useEffect(() => {
    handleFilterChange();
  }, [searchTerm, filterGroupes, filterSpecialites, filterStatut]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OK': return '#10b981'; // green
      case 'Risque': return '#f59e0b'; // orange
      case 'Éliminé': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'OK': { bg: '#d1fae5', text: '#065f46' },
      'Risque': { bg: '#fed7aa', text: '#92400e' },
      'Éliminé': { bg: '#fee2e2', text: '#991b1b' }
    };
    
    const color = colors[status] || { bg: '#f3f4f6', text: '#374151' };
    
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '20px',
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: '500',
        fontSize: '12px'
      }}>
        {status}
      </span>
    );
  };

  const handleExportCSV = async () => {
    try {
      await departmentHeadService.exportCSV();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  const handleViewDetails = (studentId) => {
    navigate(`/department-head/student/${studentId}`);
  };

  if (loading && students.length === 0) {
    return <div className="dashboard-loading">Chargement...</div>;
  }

  return (
    <div className="department-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Chef de Département</h1>
        <p>Gestion des Absences & Éliminations</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Rechercher</label>
          <input
            type="text"
            placeholder="Nom ou prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Groupe</label>
          <select
            value={filterGroupes}
            onChange={(e) => setFilterGroupes(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les groupes</option>
            {groupes.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Spécialité</label>
          <select
            value={filterSpecialites}
            onChange={(e) => setFilterSpecialites(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les spécialités</option>
            {specialites.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Statut</label>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les statuts</option>
            <option value="OK">OK</option>
            <option value="Risque">Risque</option>
            <option value="Éliminé">Éliminé</option>
          </select>
        </div>

        <button className="export-btn" onClick={handleExportCSV}>
          📥 Exporter CSV
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Spécialité</th>
              <th>Groupe</th>
              <th>Total Absences</th>
              <th>Seuil</th>
              <th>% Absentéisme</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(student => (
                <tr key={student.id}>
                  <td>
                    <strong>{student.prenom} {student.nom}</strong>
                    <br />
                    <small style={{ color: '#6b7280' }}>{student.email}</small>
                  </td>
                  <td>{student.specialite}</td>
                  <td>{student.groupe}</td>
                  <td className="center">{student.totalAbsences}</td>
                  <td className="center">{student.threshold}</td>
                  <td className="center">
                    <strong style={{ color: getStatusColor(student.eliminationStatus) }}>
                      {student.absencePercentage}%
                    </strong>
                  </td>
                  <td className="center">
                    {getStatusBadge(student.eliminationStatus)}
                  </td>
                  <td className="center">
                    <button
                      className="details-btn"
                      onClick={() => handleViewDetails(student.id)}
                    >
                      👁️ Voir détails
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  Aucun étudiant trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-number">{students.length}</div>
          <div className="stat-label">Total Étudiants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ef4444' }}>
            {students.filter(s => s.eliminationStatus === 'Éliminé').length}
          </div>
          <div className="stat-label">Éliminés</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>
            {students.filter(s => s.eliminationStatus === 'Risque').length}
          </div>
          <div className="stat-label">En Risque</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#10b981' }}>
            {students.filter(s => s.eliminationStatus === 'OK').length}
          </div>
          <div className="stat-label">OK</div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadDashboard;
