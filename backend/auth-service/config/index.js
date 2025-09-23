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
      schema: 'auth'   // 👈 toutes les tables iront dans auth
    }
  }
);

sequelize.authenticate().then(()=>{
    console.log('Connected to auth_service database');
}).catch((err)=>{
    console.log('Error: '+ err);
})
module.exports = sequelize;