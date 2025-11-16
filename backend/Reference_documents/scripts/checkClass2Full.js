const { Schedule } = require('../models');

(async () => {
  try {
    const schedules = await Schedule.findAll({
      where: { classe_id: 2 },
      attributes: ['id', 'day_of_week', 'date_debut', 'date_fin', 'recurrence', 'statut', 'start_time', 'type_cours'],
      include: [
        { association: 'matiere', attributes: ['id', 'nom'] },
        { association: 'salle', attributes: ['id', 'nom'] }
      ],
      raw: false
    });
    
    console.log('Class 2 Schedules with full data:');
    schedules.forEach(s => {
      console.log(JSON.stringify({
        id: s.id,
        day_of_week: s.day_of_week,
        date_debut: s.date_debut,
        date_fin: s.date_fin,
        recurrence: s.recurrence,
        statut: s.statut,
        start_time: s.start_time,
        type_cours: s.type_cours,
        matiere: s.matiere?.nom,
        salle: s.salle?.nom
      }, null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
