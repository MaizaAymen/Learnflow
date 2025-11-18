import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import departmentHeadService from '../services/departmentHeadService';
import './StudentDetailPage.css';

const StudentDetailPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentHeadService.getStudentDetails(studentId);
      setStudentData(data);
    } catch (err) {
      setError('Erreur lors du chargement des détails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OK': return '#10b981';
      case 'Risque': return '#f59e0b';
      case 'Éliminé': return '#ef4444';
      default: return '#6b7280';
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
        padding: '6px 14px',
        borderRadius: '20px',
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: '600',
        fontSize: '13px'
      }}>
        {status}
      </span>
    );
  };

  const getAbsenceTypeColor = (type) => {
    const colors = {
      'absent': '#ef4444',
      'excused': '#f59e0b',
      'present': '#10b981',
      'late': '#3b82f6',
      'left_early': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  if (loading) {
    return <div className="page-loading">Chargement...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  if (!studentData) {
    return <div className="page-error">Étudiant non trouvé</div>;
  }

  const { student, absences, absencesBySubject } = studentData;

  return (
    <div className="student-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/department-head')}>
          ← Retour
        </button>
        <h1>Détails Étudiant</h1>
      </div>

      {/* Section Informations Générales */}
      <div className="general-info-section">
        <h2>Informations Générales</h2>
        <div className="info-grid">
          <div className="info-card">
            <label>Nom Complet</label>
            <div className="info-value">
              <strong>{student.prenom} {student.nom}</strong>
            </div>
          </div>
          <div className="info-card">
            <label>Email</label>
            <div className="info-value">{student.email}</div>
          </div>
          <div className="info-card">
            <label>Spécialité</label>
            <div className="info-value">{student.specialite}</div>
          </div>
          <div className="info-card">
            <label>Groupe</label>
            <div className="info-value">{student.groupe}</div>
          </div>
        </div>
      </div>

      {/* Section État par Matière */}
      <div className="subjects-section">
        <h2>État par Matière</h2>
        <div className="subjects-grid">
          {absencesBySubject && absencesBySubject.length > 0 ? (
            absencesBySubject.map((subject, index) => (
              <div key={index} className="subject-card">
                <div className="subject-header">
                  <h3>{subject.subject}</h3>
                  {getStatusBadge(subject.eliminationStatus)}
                </div>
                <div className="subject-stats">
                  <div className="stat-row">
                    <span className="stat-label">Total Absences:</span>
                    <span className="stat-value">{subject.totalAbsences}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">% Absentéisme:</span>
                    <span className="stat-value" style={{ color: getStatusColor(subject.eliminationStatus) }}>
                      {subject.absencePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-message">Aucune absence enregistrée</div>
          )}
        </div>
      </div>

      {/* Section Tableau d'Absences */}
      <div className="absences-section">
        <h2>Tableau d'Absences</h2>
        <div className="absences-table-container">
          <table className="absences-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th>Horaire</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {absences && absences.length > 0 ? (
                absences.map((absence, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(absence.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td>{absence.subject}</td>
                    <td className="center">{absence.horaire}</td>
                    <td>{absence.motif}</td>
                    <td className="center">
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: getAbsenceTypeColor(absence.status),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {absence.status}
                      </span>
                    </td>
                    <td className="center">
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: absence.statut === 'approved' ? '#d1fae5' : '#fed7aa',
                        color: absence.statut === 'approved' ? '#065f46' : '#92400e',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {absence.statut}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    Aucune absence enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-value">
              {absences ? absences.length : 0}
            </div>
            <div className="summary-label">Total Absences</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-content">
            <div className="summary-value">
              {absencesBySubject ? Math.max(...absencesBySubject.map(s => s.absencePercentage), 0) : 0}%
            </div>
            <div className="summary-label">% Max Absentéisme</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📚</div>
          <div className="summary-content">
            <div className="summary-value">
              {absencesBySubject ? absencesBySubject.length : 0}
            </div>
            <div className="summary-label">Matières</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
