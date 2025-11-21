import React, { useState, useEffect } from 'react';
import './GradeManagement.css';
import { API_ENDPOINTS, getAuthHeaders } from '../../config/api';

const GradeManagement = ({ studentId, courseId, isTeacher }) => {
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [chartData, setChartData] = useState(null);

  const [formData, setFormData] = useState({
    studentId: studentId || '',
    subjectId: '',
    gradeType: 'exam',
    marks: 0,
    maxMarks: 20,
    feedback: '',
  });

  useEffect(() => {
    if (studentId || courseId) {
      fetchGrades();
    }
  }, [studentId, courseId]);

  const fetchGrades = async () => {
    if (!studentId && !courseId) {
      console.log('No studentId or courseId provided');
      return;
    }
    try {
      const endpoint = isTeacher 
        ? `${API_ENDPOINTS.GRADES}/course/${courseId}`
        : `${API_ENDPOINTS.GRADES}/student/${studentId}`;
      
      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      setGrades(data);

      // Calculate statistics
      const stats = calculateStats(data);
      setStats(stats);
      prepareChartData(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const calculateStats = (gradesData) => {
    if (gradesData.length === 0) return null;

    const total = gradesData.reduce((sum, g) => sum + g.marks, 0);
    const average = (total / gradesData.length).toFixed(2);
    
    const byType = {};
    gradesData.forEach(g => {
      if (!byType[g.gradeType]) byType[g.gradeType] = [];
      byType[g.gradeType].push(g.marks);
    });

    return { average, total, gradesData: gradesData.length, byType };
  };

  const prepareChartData = (gradesData) => {
    const data = gradesData.slice(-10).map(g => ({
      name: g.description || `${g.gradeType}`,
      value: g.marks,
    }));
    setChartData(data);
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ studentId: '', subjectId: '', gradeType: 'exam', marks: 0, maxMarks: 20, feedback: '' });
        setShowForm(false);
        fetchGrades();
      }
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const exportPDF = () => {
    // PDF export functionality
    const pdf = new jsPDF();
    pdf.text('Grade Report', 10, 10);
    grades.forEach((grade, index) => {
      pdf.text(`${grade.description}: ${grade.marks}/${grade.maxMarks}`, 10, 20 + index * 10);
    });
    pdf.save('grade_report.pdf');
  };

  return (
    <div className="grade-management">
      <div className="grade-header">
        <h2>📊 Grade Management</h2>
        {isTeacher && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'Add Grade'}
          </button>
        )}
        <button onClick={exportPDF} className="btn-secondary">📥 Download PDF</button>
      </div>

      {showForm && isTeacher && (
        <form onSubmit={handleAddGrade} className="grade-form">
          <input
            type="text"
            placeholder="Student ID"
            value={formData.studentId}
            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Subject ID"
            value={formData.subjectId}
            onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
            required
          />
          <select value={formData.gradeType} onChange={(e) => setFormData({...formData, gradeType: e.target.value})}>
            <option value="exam">Exam</option>
            <option value="homework">Homework</option>
            <option value="project">Project</option>
            <option value="participation">Participation</option>
            <option value="midterm">Midterm</option>
            <option value="final">Final</option>
          </select>
          <input
            type="number"
            placeholder="Marks"
            value={formData.marks}
            onChange={(e) => setFormData({...formData, marks: parseFloat(e.target.value)})}
            min="0"
            max={formData.maxMarks}
            required
          />
          <textarea
            placeholder="Feedback (optional)"
            value={formData.feedback}
            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
          />
          <button type="submit" className="btn-success">Save Grade</button>
        </form>
      )}

      {stats && (
        <div className="grade-stats">
          <div className="stat-card">
            <div className="stat-label">Average</div>
            <div className="stat-value">{stats.average}/20</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Grades</div>
            <div className="stat-value">{stats.gradesData}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Percentage</div>
            <div className="stat-value">{((stats.average / 20) * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="grades-list">
        <h3>Grade History</h3>
        <table className="grades-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Marks</th>
              <th>Max</th>
              <th>Percentage</th>
              <th>Feedback</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td><span className="badge">{grade.gradeType}</span></td>
                <td>{grade.description}</td>
                <td className="marks-cell">{grade.marks}</td>
                <td>{grade.maxMarks}</td>
                <td>{grade.percentage}%</td>
                <td className="feedback-cell">{grade.feedback || '-'}</td>
                <td>{new Date(grade.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeManagement;
