const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('auth_service','postgres','aymen',{
    host:'localhost',
    dialect:'postgres'
});

sequelize.authenticate().then(()=>{
    console.log('Connected to auth_service database');
}).catch((err)=>{
    console.log('Error: '+ err);
})
module.exports = sequelize;