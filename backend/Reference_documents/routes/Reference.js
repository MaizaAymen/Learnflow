const express = require('express');
const router = express.Router();

// Import models/index.js first to ensure associations are loaded
require('../models/index');

const specialite = require('../models/Specialite');
const Departement = require('../models/Département');
const Niveau = require('../models/Niveau');
const Classe = require('../models/Classe');
const salle = require('../models/Salle');
const matiere = require('../models/Matiére');
const matiereClasse = require('../models/MatiereClasse');
const matiereEnseignant = require('../models/MatiereEnseignant');

// Keep lowercase aliases for backward compatibility
const departement = Departement;
const niveau = Niveau;

// Import Calendar routes
const calendarRoutes = require('./Calendar');
// CRUD Specialite
router.post('/specialites', async (req, res) => {
  try {
    const { name, description, departementId, code, duree_annees } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom de la spécialité est requis' });
    }
    if (!departementId) {
      return res.status(400).json({ error: 'Le département est requis' });
    }
    
    // Verify departement exists
    const deptExists = await Departement.findByPk(departementId);
    if (!deptExists) {
      return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
    }
    
    const newSpecialite = await specialite.create({ 
      name, 
      description, 
      departementId,
      code,
      duree_annees 
    });
    
    // Return with departement details
    const specWithDept = await specialite.findByPk(newSpecialite.id, {
      include: [{ model: Departement, as: 'departement' }]
    });
    
    res.status(201).json(specWithDept);
  } catch (error) {
    console.error('Error creating specialite:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une spécialité avec ce code existe déjà' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/specialites', async (req, res) => {
    try {
        const spec = await specialite.findAll({
          include: [{ 
            model: Departement, 
            as: 'departement',
            attributes: ['id', 'name', 'code']
          }]
        });
        if (!spec){
            return res.json({message:"Aucune spécialité n'est disponible pour le moment"})
        }
        return res.status(200).json(spec);
    } catch (error) {
        console.error('Error fetching specialites:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/specialites/:id', async (req, res) => {
    try 
    {
     const spes = await specialite.findByPk(req.params.id);
     if (!spes){
        return res.status(404).json({message:"Spécialité introuvable"})
     }
     return res.status(200).json(spes);
    } catch (error) {
        console.error('Error fetching specialite:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//kan y7ib ybadel esm w description
router.put('/specialites/:id', async (req, res) => {
  try{
      const {name, description, departementId}=req.body;
      const spes = await specialite.findByPk(req.params.id);
      if(!spes){
        return res.status(404).json({message:"Spécialité introuvable"})
      }
      await spes.update({name, description, departementId})
      return res.status(200).json({message:"Spécialité mise à jour avec succès", data: spes})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }})
router.delete('/specialites/:id', async (req, res) => {
    try{
  const spes = await specialite.findByPk(req.params.id);

  if (!spes){
    return res.status(404).json({message:"Spécialité introuvable"})
  }
  await spes.destroy();
  return res.status(200).json({message:"Spécialité supprimée avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})

// Search specialites by name
router.get('/specialites/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op, Model } = require('sequelize');
    const results = await specialite.findAll({
      where: {
        nom: {
          [Op.like]: `%${term}%`
        }
      }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching specialites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specialite count
router.get('/specialites/stats/count', async (req, res) => {
  try {
    const count = await specialite.count();
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error counting specialites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// CRUD Département
router.post('/adddepartements', async (req, res) => {
  try {
    console.log('Received department creation request:', req.body);
    const { name, description , code, chef_departement_id, budget, statut, localisation, telephone, email, capacite_max } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Le nom du département est requis' });
    }
    if (!code) {
      return res.status(400).json({ error: 'Le code du département est requis' });
    }
    
    // Create department data object
    const departementData = {
      name,
      description,
      code,
      chef_departement_id: chef_departement_id || null,
      budget: budget || 0,
      statut: statut || 'actif',
      localisation,
      telephone,
      email,
      capacite_max: capacite_max || 50
    };
    
    console.log('Creating department with data:', departementData);
    const newdepartment = await departement.create(departementData);
    console.log('Department created successfully:', newdepartment.toJSON());
    res.status(201).json(newdepartment);
  }catch (error) {
    console.error('Error creating departement:', error);
    // Send more specific error message
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Un département avec ce code existe déjà' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le chef de département spécifié n\'existe pas' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }})
router.get('/departements', async (req, res) => {
    try {
      const dep = await departement.findAll();
      if (!dep){
          return res.json({message:"Aucun département n'est disponible pour le moment"})
      }
      return res.status(200).json(dep);
    }catch(error){
      return res.status(500).json({
        error: 'Internal server error'
      })
    }})

router.get('/departements/:id',async (req,res)=>{
    try {
      const id = req.params.id;
      if (!id){
        return res.status(400).json({error:"ID manquant"})
      }
       return await departement.findByPk(id)
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
      
    }
    })
//update
router.put('/departements/:id', async (req, res) => {
  try{
      const {name,description,code,chef_departement_id,budget,statut,localisation,telephone,email,capacite_max}=req.body;
      const dep = await departement.findByPk(req.params.id);
      if(!dep){
        return res.status(404).json({message:"Département introuvable"})
      }
      await dep.update({name,description,code,chef_departement_id,budget,statut,localisation,telephone,email,capacite_max})
      return res.status(200).json({message:"Département mis à jour avec succès"})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }})
router.delete('/departements/:id', async (req, res) => {
    try{
  const id = req.params.id;
  const dep = await departement.findByPk(id);
  if (!dep){
    return res.status(404).json({message:"Département introuvable"})
  }
  await dep.destroy();  
  return res.status(200).json({message:"Département supprimé avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})

// Search departements by name or code
router.get('/departements/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op } = require('sequelize');
    const results = await departement.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${term}%` } },
          { code: { [Op.like]: `%${term}%` } }
        ]
      }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching departements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departement statistics
router.get('/departements/stats/summary', async (req, res) => {
  try {
    const count = await departement.count();
    const { Op } = require('sequelize');
    const activeCount = await departement.count({
      where: { statut: 'actif' }
    });
    return res.status(200).json({ 
      total: count, 
      active: activeCount,
      inactive: count - activeCount 
    });
  } catch (error) {
    console.error('Error getting departement stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departements by status
router.get('/departements/filter/statut/:statut', async (req, res) => {
  try {
    const { statut } = req.params;
    const results = await departement.findAll({
      where: { statut }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering departements by status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// CRUD Niveau
router.post('/niveaux', async (req, res) => {
  try {
    const { name, description, specialiteId, ordre } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom du niveau est requis' });
    }
    if (!specialiteId) {
      return res.status(400).json({ error: 'La spécialité est requise' });
    }
    
    // Verify specialite exists
    const specExists = await specialite.findByPk(specialiteId);
    if (!specExists) {
      return res.status(400).json({ error: 'La spécialité spécifiée n\'existe pas' });
    }
    
    const newNiveau = await niveau.create({ 
      name, 
      description, 
      specialiteId,
      ordre 
    });
    
    // Return with specialite details
    const nivWithSpec = await niveau.findByPk(newNiveau.id, {
      include: [{
        model: specialite,
        as: 'specialite',
        include: [{ model: Departement, as: 'departement' }]
      }]
    });
    
    res.status(201).json(nivWithSpec);
  } catch (error) {
    console.error('Error creating niveau:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'La spécialité spécifiée n\'existe pas' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
})

router.get('/niveaux', async (req, res) => {
    try {
      const niv = await niveau.findAll({
        include: [{
          model: specialite,
          as: 'specialite',
          attributes: ['id', 'name', 'code'],
          include: [{
            model: Departement,
            as: 'departement',
            attributes: ['id', 'name', 'code']
          }]
        }]
      });  
      if (!niv) {
        return res.json({ message: "Aucun niveau n'est disponible pour le moment" });
      }
      return res.status(200).json(niv);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

router.get('/niveaux/:id',async (req,res)=>{
    try {
      const id = req.params.id;
      if (!id){
        return res.status(400).json({error:"ID manquant"})
      }
      const niv = await niveau.findByPk(id);
      if (!niv){
        return res.status(404).json({error:"Niveau introuvable"})
      }
      return res.status(200).json(niv);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
//update
router.put('/niveaux/:id', async (req, res) => {
  try{
      const {nom,description}=req.body;
      const niv = await niveau.findByPk(req.params.id);
      if(!niv){
        return res.status(404).json({message:"Niveau introuvable"})
      }
      await niv.update({nom,description})
      return res.status(200).json({message:"Niveau mis à jour avec succès"})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }})
router.delete('/niveaux/:id', async (req, res) => {
    try{
  const id = req.params.id;
  const niv = await niveau.findByPk(id);
  if (!niv){
    return res.status(404).json({message:"Niveau introuvable"})
  }
  await niv.destroy();
  return res.status(200).json({message:"Niveau supprimé avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})

// Search niveaux by name
router.get('/niveaux/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op } = require('sequelize');
    const results = await niveau.findAll({
      where: {
        nom: {
          [Op.like]: `%${term}%`
        }
      }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching niveaux:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get classes by niveau
router.get('/niveaux/:id/classes', async (req, res) => {
  try {
    const { id } = req.params;
    const classes = await Classe.findAll({
      where: { niveau_id: id }
    });
    return res.status(200).json(classes);
  } catch (error) {
    console.error('Error getting classes by niveau:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// CRUD Classe
router.post('/classes', async (req, res) => {
  try {
    console.log('Received classe creation request:', req.body);
    const { nom, description, effectif, niveau_id, annee_scolaire } = req.body;
    
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la classe est requis' });
    }
    if (!niveau_id) {
      return res.status(400).json({ error: 'Le niveau est requis' });
    }
    
    // Verify niveau exists
    const niveauExists = await Niveau.findByPk(niveau_id);
    if (!niveauExists) {
      return res.status(400).json({ error: 'Le niveau spécifié n\'existe pas' });
    }
    
    const newClasse = await Classe.create({ 
      nom, 
      description, 
      effectif: effectif || 0, 
      niveau_id,
      annee_scolaire
    });
    
    console.log('Classe created successfully:', newClasse.toJSON());
    
    // Return with full hierarchy
    const classeWithDetails = await Classe.findByPk(newClasse.id, {
      include: [{
        model: Niveau,
        as: 'niveau',
        include: [{
          model: specialite,
          as: 'specialite',
          include: [{
            model: Departement,
            as: 'departement'
          }]
        }]
      }]
    });
    
    return res.status(201).json(classeWithDetails);
    
  } catch (error) {
    console.error('Error creating classe:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le niveau spécifié n\'existe pas' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});
router.get('/classes', async (req, res) => {
    try {
      const classes = await Classe.findAll({
        include: [
          {
            model: Niveau,
            as: 'niveau',
            attributes: ['id', 'name'],
            required: false,
            include: [
              {
                model: specialite,
                as: 'specialite',
                attributes: ['id', 'name'],
                required: false,
                include: [
                  {
                    model: Departement,
                    as: 'departement',
                    attributes: ['id', 'name'],
                    required: false
                  }
                ]
              }
            ]
          }
        ]
      });
      if (!classes || classes.length === 0) {
        return res.json([]);
      }
      return res.status(200).json(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

router.get('/classes/:id',async (req,res)=>{
    try {
      const id = req.params.id;
      if (!id){
        return res.status(400).json({error:"ID manquant"})
      }
      const classeFound = await Classe.findByPk(id);
      if (!classeFound){
        return res.status(404).json({error:"Classe introuvable"})
      }
      return res.status(200).json(classeFound);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
//update
router.put('/classes/:id', async (req, res) => {
  try{
      const {nom,description}=req.body;
      const classeToUpdate = await Classe.findByPk(req.params.id);
      if(!classeToUpdate){
        return res.status(404).json({message:"Classe introuvable"})
      }
      await classeToUpdate.update({nom,description})
      return res.status(200).json({message:"Classe mise à jour avec succès"})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }
})
router.delete('/classes/:id', async (req, res) => {
    try{
  const id = req.params.id;
  const classeToDelete = await Classe.findByPk(id);
  if (!classeToDelete){
    return res.status(404).json({message:"Classe introuvable"})
  }
  await classeToDelete.destroy();
  return res.status(200).json({message:"Classe supprimée avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})

// Search classes by name
router.get('/classes/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op } = require('sequelize');
    const results = await Classe.findAll({
      where: {
        nom: {
          [Op.like]: `%${term}%`
        }
      }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get classe statistics
router.get('/classes/stats/summary', async (req, res) => {
  try {
    const count = await Classe.count();
    const { fn, col } = require('sequelize').Sequelize;
    const totalEffectif = await Classe.sum('effectif') || 0;
    const avgEffectif = await Classe.findAll({
      attributes: [[fn('AVG', col('effectif')), 'average']]
    });
    return res.status(200).json({ 
      totalClasses: count,
      totalStudents: totalEffectif,
      averageSize: avgEffectif[0]?.dataValues?.average || 0
    });
  } catch (error) {
    console.error('Error getting classe stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD Salle
router.post('/salles', async (req, res) => {
  try {
    const { nom, type, capacite, localisation, description, departement_id, equipements, statut } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la salle est requis' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Le type de la salle est requis' });
    }
    if (!capacite) {
      return res.status(400).json({ error: 'La capacité est requise' });
    }
    if (isNaN(capacite) || capacite <= 0) {
      return res.status(400).json({ error: 'La capacité doit être un nombre positif' });
    }
    if (!departement_id) {
      return res.status(400).json({ error: 'Le département est requis' });
    }
    
    // Verify departement exists
    const deptExists = await Departement.findByPk(departement_id);
    if (!deptExists) {
      return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
    }
      
    const newSalle = await salle.create({ 
      nom, 
      type, 
      capacite, 
      localisation, 
      description,
      departement_id,
      equipements,
      statut: statut || 'disponible'
    });
    
    // Return with departement details
    const salleWithDept = await salle.findByPk(newSalle.id, {
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    
    res.status(201).json(salleWithDept);
  } catch (error) {
    console.error('Error creating salle:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une salle avec ce nom existe déjà' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/salles', async (req, res) => {
  try {
    const salles = await salle.findAll({
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    if (!salles) {
      return res.json({ message: "Aucune salle n'est disponible pour le moment" });
    }
    return res.status(200).json(salles);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/salles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID manquant" });
    }
    const salleFound = await salle.findByPk(id);
    if (!salleFound) {
      return res.status(404).json({ error: "Salle introuvable" });
    }
    return res.status(200).json(salleFound);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/salles/:id', async (req, res) => {
  try {
    const { nom, type, capacite, localisation, description, departement_id, equipements, statut } = req.body;
    const salleToUpdate = await salle.findByPk(req.params.id);
    if (!salleToUpdate) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    
    // If changing departement, verify it exists
    if (departement_id && departement_id !== salleToUpdate.departement_id) {
      const deptExists = await Departement.findByPk(departement_id);
      if (!deptExists) {
        return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
      }
    }
    
    await salleToUpdate.update({ 
      nom, 
      type, 
      capacite, 
      localisation, 
      description,
      departement_id,
      equipements,
      statut
    });
    
    // Return with departement details
    const updatedSalle = await salle.findByPk(req.params.id, {
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    
    return res.status(200).json(updatedSalle);
  } catch (error) {
    console.error('Error updating salle:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une salle avec ce nom existe déjà' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le département spécifié n\'existe pas' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/salles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const salleToDelete = await salle.findByPk(id);
    if (!salleToDelete) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    await salleToDelete.destroy();
    return res.status(200).json({ message: "Salle supprimée avec succès" });
  } catch (error) {
    console.error('Error deleting salle:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cette salle car elle est utilisée dans des emplois du temps' 
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Search salles by name or type
router.get('/salles/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op } = require('sequelize');
    const results = await salle.findAll({
      where: {
        [Op.or]: [
          { nom: { [Op.like]: `%${term}%` } },
          { type: { [Op.like]: `%${term}%` } }
        ]
      },
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching salles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Filter salles by type
router.get('/salles/filter/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const results = await salle.findAll({
      where: { type },
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering salles by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available salles by minimum capacity
router.get('/salles/filter/capacity/:minCapacity', async (req, res) => {
  try {
    const { minCapacity } = req.params;
    const { Op } = require('sequelize');
    const results = await salle.findAll({
      where: {
        capacite: {
          [Op.gte]: parseInt(minCapacity)
        }
      },
      include: [{ 
        model: Departement, 
        as: 'departement',
        attributes: ['id', 'name', 'code']
      }]
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering salles by capacity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CRUD Matière
router.post('/matieres', async (req, res) => {
  try {
    const { name, description, code, credits, niveauId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom de la matière est requis' });
    }
    if (!code) {
      return res.status(400).json({ error: 'Le code de la matière est requis' });
    }
    if (!niveauId) {
      return res.status(400).json({ error: 'Le niveau est requis' });
    }
    
    // Verify niveau exists
    const nivExists = await niveau.findByPk(niveauId);
    if (!nivExists) {
      return res.status(400).json({ error: 'Le niveau spécifié n\'existe pas' });
    }
    
    const newMatiere = await matiere.create({ 
      name, 
      description, 
      code, 
      credits: credits || 3, 
      niveauId 
    });
    
    // Return with niveau details
    const matWithNiv = await matiere.findByPk(newMatiere.id, {
      include: [{
        model: niveau,
        as: 'niveau',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(201).json(matWithNiv);
  } catch (error) {
    console.error('Error creating matiere:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Une matière avec ce code existe déjà' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Le niveau spécifié n\'existe pas' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/matieres', async (req, res) => {
  try {
    const matieres = await matiere.findAll({
      include: [{
        model: niveau,
        as: 'niveau',
        attributes: ['id', 'name'],
        include: [{
          model: specialite,
          as: 'specialite',
          attributes: ['id', 'name', 'departementId'],
          include: [{
            model: departement,
            as: 'departement',
            attributes: ['id', 'name']
          }]
        }]
      }]
    });
    if (!matieres) {
      return res.json({ message: "Aucune matière n'est disponible pour le moment" });
    }
    return res.status(200).json(matieres);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/matieres/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID manquant" });
    }
    const matiereFound = await matiere.findByPk(id);
    if (!matiereFound) {
      return res.status(404).json({ error: "Matière introuvable" });
    }
    return res.status(200).json(matiereFound);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teachers (enseignants) for a specific matière
router.get('/matieres/:id/enseignants', async (req, res) => {
  try {
    const matiereId = req.params.id;
    
    if (!matiereId) {
      return res.status(400).json({ error: "ID matière manquant" });
    }

    // Find the matière and include its teachers via MatiereEnseignant junction table
    const User = require('../../auth-service/models/userModel');
    const MatiereEnseignant = require('../models/MatiereEnseignant');

    const teachers = await User.findAll({
      attributes: ['id', 'nom', 'prenom', 'email', 'departement'],
      where: { role: 'enseignant' },
      include: [{
        model: matiere,
        as: 'matieres',
        where: { id: matiereId },
        attributes: [],
        through: { attributes: [] },
        required: true
      }]
    });

    return res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers for matière:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/matieres/:id', async (req, res) => {
  try {
    const { name, description, code, credits, niveauId } = req.body;
    const matiereToUpdate = await matiere.findByPk(req.params.id);
    if (!matiereToUpdate) {
      return res.status(404).json({ message: "Matière introuvable" });
    }
    await matiereToUpdate.update({ name, description, code, credits, niveauId });
    return res.status(200).json({ message: "Matière mise à jour avec succès" });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/matieres/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const matiereToDelete = await matiere.findByPk(id);
    if (!matiereToDelete) {
      return res.status(404).json({ message: "Matière introuvable" });
    }
    await matiereToDelete.destroy();
    return res.status(200).json({ message: "Matière supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});



//iaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa--------------------------------------

// Search matieres by name or code
router.get('/matieres/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { Op } = require('sequelize');
    const results = await matiere.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${term}%` } },
          { code: { [Op.like]: `%${term}%` } }
        ]
      }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching matieres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get matieres by niveau
router.get('/matieres/filter/niveau/:niveauId', async (req, res) => {
  try {
    const { niveauId } = req.params;
    const results = await matiere.findAll({
      where: { niveauId }
    });
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error filtering matieres by niveau:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get matiere statistics
router.get('/matieres/stats/summary', async (req, res) => {
  try {
    const count = await matiere.count();
    const totalCredits = await matiere.sum('credits') || 0;
    return res.status(200).json({ 
      totalMatieres: count,
      totalCredits: totalCredits
    });
  } catch (error) {
    console.error('Error getting matiere stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create matieres
router.post('/matieres/bulk', async (req, res) => {
  try {
    const { matieres } = req.body;
    if (!Array.isArray(matieres) || matieres.length === 0) {
      return res.status(400).json({ error: 'Un tableau de matières est requis' });
    }
    const createdMatieres = await matiere.bulkCreate(matieres);
    res.status(201).json(createdMatieres);
  } catch (error) {
    console.error('Error bulk creating matieres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// TEACHERS ENDPOINTS
// ============================================================================

// Get all teachers (enseignants)
router.get('/teachers', async (req, res) => {
  try {
    const User = require('../../auth-service/models/userModel');
    const teachers = await User.findAll({
      where: {
        role: 'enseignant'
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'cin', 'specialite', 'departement'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });
    
    if (!teachers || teachers.length === 0) {
      return res.json({
        message: "Aucun enseignant disponible pour le moment",
        data: []
      });
    }
    
    return res.status(200).json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher by ID
router.get('/teachers/:id', async (req, res) => {
  try {
    const User = require('../../auth-service/models/userModel');
    const teacher = await User.findByPk(req.params.id, {
      where: {
        role: 'enseignant'
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'cin', 'specialite', 'departement']
    });
    
    if (!teacher) {
      return res.status(404).json({ message: "Enseignant introuvable" });
    }
    
    return res.status(200).json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (used to set teacher as chef de department)
router.put('/users/:id/role', async (req, res) => {
  try {
    const User = require('../../auth-service/models/userModel');
    const { role } = req.body;
    
    console.log(`[PUT /users/:id/role] Attempting to update user ${req.params.id} to role: ${role}`);
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      console.log(`[PUT /users/:id/role] User not found: ${req.params.id}`);
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    
    console.log(`[PUT /users/:id/role] Found user: ${user.nom} ${user.prenom}, current role: ${user.role}`);
    
    // If setting chef_de_department, set the flag
    if (role === 'chef_de_department') {
      console.log(`[PUT /users/:id/role] Setting user as department head (is_department_head = true)`);
      user.is_department_head = true;
      
      // Try to set the actual role if ENUM supports it, otherwise keep as enseignant
      try {
        user.role = role;
        await user.save();
        console.log(`[PUT /users/:id/role] Successfully updated role to: ${user.role}`);
      } catch (enumError) {
        console.log(`[PUT /users/:id/role] Cannot set role enum to chef_de_department, keeping as enseignant but marking as department head`);
        user.role = 'enseignant'; // Keep as enseignant if ENUM doesn't support it yet
        await user.save();
        console.log(`[PUT /users/:id/role] User marked as department head with is_department_head flag`);
      }
    } else if (['etudiant','enseignant','directeur','admin'].includes(role)) {
      // For standard roles, just update normally
      user.role = role;
      user.is_department_head = false;
      await user.save();
      console.log(`[PUT /users/:id/role] Successfully updated role to: ${user.role}`);
    } else {
      console.log(`[PUT /users/:id/role] Invalid role: ${role}`);
      return res.status(400).json({ message: "Rôle invalide" });
    }
    
    return res.status(200).json({
      message: "Rôle utilisateur mis à jour avec succès",
      data: user
    });
  } catch (error) {
    console.error('[PUT /users/:id/role] Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get teacher's assigned matières (supports both 'enseignant' and 'chef_de_department' roles)
router.get('/teachers/:id/matieres', async (req, res) => {
  try {
    const User = require('../../auth-service/models/userModel');
    const teacher = await User.findByPk(req.params.id, {
      where: { 
        role: ['enseignant', 'chef_de_department'] 
      },
      include: [{
        model: matiere,
        as: 'matieres',
        attributes: ['id', 'name', 'code'],
        through: { attributes: [] }
      }]
    });
    
    if (!teacher) {
      return res.status(404).json({ error: "Enseignant ou Chef de département introuvable" });
    }
    
    return res.status(200).json(teacher.matieres || []);
  } catch (error) {
    console.error('Error fetching teacher matieres:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign matières to a teacher or chef de département
router.post('/teachers/:id/assign-matieres', async (req, res) => {
  try {
    const { matieresIds } = req.body;
    const teacherId = req.params.id;
    
    if (!Array.isArray(matieresIds)) {
      return res.status(400).json({ error: 'matieresIds must be an array' });
    }
    
    const User = require('../../auth-service/models/userModel');
    const teacher = await User.findByPk(teacherId, {
      where: { 
        role: ['enseignant', 'chef_de_department'] 
      }
    });
    
    if (!teacher) {
      return res.status(404).json({ error: "Enseignant ou Chef de département introuvable" });
    }
    
    // Verify all matières exist
    const matieres = await matiere.findAll({
      where: { id: matieresIds }
    });
    
    if (matieres.length !== matieresIds.length) {
      return res.status(400).json({ error: "Une ou plusieurs matières n'existent pas" });
    }
    
    // Remove all existing assignments for this teacher/chef
    await teacher.removeMatieres();
    
    // Assign selected matières
    if (matieresIds.length > 0) {
      await teacher.addMatieres(matieresIds);
    }
    
    // Return updated assignments
    const updatedTeacher = await User.findByPk(teacherId, {
      include: [{
        model: matiere,
        as: 'matieres',
        attributes: ['id', 'name', 'code'],
        through: { attributes: [] }
      }]
    });
    
    res.status(200).json({
      message: 'Matières assignées avec succès',
      matieres: updatedTeacher.matieres || []
    });
  } catch (error) {
    console.error('Error assigning matieres to teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use Calendar routes
router.use('/calendar', calendarRoutes);

module.exports = router;

