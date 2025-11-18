import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import departmentHeadService from '../services/departmentHeadService';
import './DepartmentStatistics.css';

// For charts - we'll use simple canvas-based charts
const BarChart = ({ data, labels, title }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(title, padding, 25);

    // Draw axes
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    const maxValue = Math.max(...data);
    const barWidth = chartWidth / data.length;
    
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + index * barWidth + barWidth / 4;
      const y = canvas.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, barWidth / 2, barHeight);

      // Draw label
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 4, canvas.height - padding + 20);

      // Draw value
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(value, x + barWidth / 4, y - 5);
    });
  }, [data, labels, title]);

  return <canvas ref={canvasRef} width={600} height={300} className="chart-canvas" />;
};

const PieChart = ({ data, labels, title }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, 30);

    // Draw pie
    const total = data.reduce((a, b) => a + b, 0);
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    let currentAngle = -Math.PI / 2;

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;

      // Draw slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], labelX, labelY);
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.fillText(`${value}`, labelX, labelY + 15);

      currentAngle += sliceAngle;
    });
  }, [data, labels, title]);

  return <canvas ref={canvasRef} width={400} height={300} className="chart-canvas" />;
};

const DepartmentStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentHeadService.getStatistics();
      setStats(data);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">Chargement des statistiques...</div>;
  }

  if (error) {
    return <div className="stats-error">{error}</div>;
  }

  if (!stats) {
    return <div className="stats-error">Aucune donnée disponible</div>;
  }

  // Prepare data for charts
  const statusData = [stats.okCount, stats.atRiskCount, stats.eliminatedCount];
  const statusLabels = ['OK', 'Risque', 'Éliminé'];

  const absenceTrendData = stats.absencesByDate 
    ? stats.absencesByDate.map(d => parseInt(d.count))
    : [];
  const absenceTrendLabels = stats.absencesByDate
    ? stats.absencesByDate.map(d => new Date(d.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }))
    : [];

  const specialityLabels = stats.studentsBySpecialite
    ? Object.keys(stats.studentsBySpecialite)
    : [];
  const specialityData = stats.studentsBySpecialite
    ? Object.values(stats.studentsBySpecialite)
    : [];

  return (
    <div className="statistics-page">
      <div className="stats-header">
        <button className="back-btn" onClick={() => navigate('/department-head')}>
          ← Retour
        </button>
        <h1>Statistiques du Département</h1>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalStudents}</div>
            <div className="metric-label">Total Étudiants</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value" style={{ color: '#10b981' }}>{stats.okCount}</div>
            <div className="metric-label">Étudiants OK</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value" style={{ color: '#f59e0b' }}>{stats.atRiskCount}</div>
            <div className="metric-label">En Risque</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <div className="metric-value" style={{ color: '#ef4444' }}>{stats.eliminatedCount}</div>
            <div className="metric-label">Éliminés</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{stats.averageAbsenteeismRate}%</div>
            <div className="metric-label">Taux Moyen Absentéisme</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Répartition par Statut</h3>
          <PieChart 
            data={statusData} 
            labels={statusLabels}
            title="État des Étudiants"
          />
        </div>

        {absenceTrendData.length > 0 && (
          <div className="chart-container">
            <h3>Tendance des Absences (2 dernières semaines)</h3>
            <BarChart 
              data={absenceTrendData} 
              labels={absenceTrendLabels}
              title="Absences par Jour"
            />
          </div>
        )}

        {specialityData.length > 0 && (
          <div className="chart-container">
            <h3>Étudiants par Spécialité</h3>
            <BarChart 
              data={specialityData} 
              labels={specialityLabels}
              title="Distribution par Spécialité"
            />
          </div>
        )}
      </div>

      {/* Detailed Statistics Table */}
      <div className="detailed-stats-section">
        <h2>Statistiques Détaillées</h2>
        
        <div className="stats-grid">
          <div className="stats-card">
            <h4>Résumé Général</h4>
            <ul className="stats-list">
              <li>
                <span>Total Étudiants:</span>
                <strong>{stats.totalStudents}</strong>
              </li>
              <li>
                <span>Étudiants OK:</span>
                <strong style={{ color: '#10b981' }}>
                  {stats.okCount} ({Math.round((stats.okCount / stats.totalStudents) * 100)}%)
                </strong>
              </li>
              <li>
                <span>En Risque:</span>
                <strong style={{ color: '#f59e0b' }}>
                  {stats.atRiskCount} ({Math.round((stats.atRiskCount / stats.totalStudents) * 100)}%)
                </strong>
              </li>
              <li>
                <span>Éliminés:</span>
                <strong style={{ color: '#ef4444' }}>
                  {stats.eliminatedCount} ({Math.round((stats.eliminatedCount / stats.totalStudents) * 100)}%)
                </strong>
              </li>
            </ul>
          </div>

          <div className="stats-card">
            <h4>Métriques d'Absentéisme</h4>
            <ul className="stats-list">
              <li>
                <span>Taux Moyen:</span>
                <strong>{stats.averageAbsenteeismRate}%</strong>
              </li>
              <li>
                <span>Nombre de Spécialités:</span>
                <strong>{specialityLabels.length}</strong>
              </li>
              <li>
                <span>Enregistrements d'Absences:</span>
                <strong>
                  {absenceTrendData.reduce((a, b) => a + b, 0)}
                </strong>
              </li>
              <li>
                <span>Période Analysée:</span>
                <strong>2 semaines</strong>
              </li>
            </ul>
          </div>
        </div>

        {specialityLabels.length > 0 && (
          <div className="specialties-section">
            <h4>Distribution par Spécialité</h4>
            <table className="specialties-table">
              <thead>
                <tr>
                  <th>Spécialité</th>
                  <th>Nombre d'Étudiants</th>
                  <th>Pourcentage</th>
                </tr>
              </thead>
              <tbody>
                {specialityLabels.map((specialty, index) => (
                  <tr key={index}>
                    <td>{specialty}</td>
                    <td className="center">{specialityData[index]}</td>
                    <td className="center">
                      {Math.round((specialityData[index] / stats.totalStudents) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentStatistics;
