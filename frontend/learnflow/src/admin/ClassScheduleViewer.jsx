import React, { useState } from 'react';
import WeeklySchedule from '../components/WeeklySchedule';
import './ClassScheduleViewer.css';

const ClassScheduleViewer = () => {
  const [selectedClasseId, setSelectedClasseId] = useState(1);
  const [className, setClassName] = useState('G1');

  // This would normally come from an API call to get all classes
  const classes = [
    { id: 1, name: 'G1 Info' },
    { id: 2, name: 'G2 Info' },
    { id: 3, name: 'G3 Info' },
    { id: 4, name: 'G1 Mécanique' },
    { id: 5, name: 'G2 Mécanique' },
  ];

  return (
    <div className="class-schedule-viewer">
      <div className="viewer-header">
        <h1>🏫 Planning des Classes</h1>
        <div className="class-selector">
          <label>Sélectionner une classe:</label>
          <select 
            value={selectedClasseId}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelectedClasseId(id);
              const selected = classes.find(c => c.id === id);
              setClassName(selected?.name || 'Classe');
            }}
          >
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <WeeklySchedule classeId={selectedClasseId} className={className} />
    </div>
  );
};

export default ClassScheduleViewer;
