const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'auth_service', // la base
  'postgres',     // user
  'aymen',        // password
  {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    define: {
      schema: 'referentiels'   // 👈 toutes les tables iront dans referentiels
    }
  }
);

sequelize.authenticate().then(()=>{
    console.log('Connected to auth_service database (referentiels schema)');
}).catch((err)=>{
    console.log('Error: '+ err);
});

module.exports = sequelize;

