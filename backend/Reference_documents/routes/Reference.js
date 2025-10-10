const express = require('express');
const router = express.Router();
const specialite = require('../models/Specialite');
const departement = require('../models/Département');
const niveau = require('../models/Niveau');
const Classe = require('../models/Classe');
const salle = require('../models/Salle');
const matiere = require('../models/Matiére');
const matiereClasse = require('../models/MatiereClasse');
const matiereEnseignant = require('../models/MatiereEnseignant');
// CRUD Specialite
router.post('/specialites', async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la spécialité est requis' });
    }
    const newSpecialite = await specialite.create({ nom, description });
    res.status(201).json(newSpecialite);
  } catch (error) {
    console.error('Error creating specialite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/specialites', async (req, res) => {
    try {
        const spec = await specialite.findAll();
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
     const spes = await specialite.findByPK({where:{id:req.params.id}});
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
      const {nom,description}=req.body;
      const spes = await specialite.findByPK({where:{id:req.params.id}});///specialites/:id <---- //
      if(!spes){
        return res.status(404).json({message:"Spécialité introuvable"})
      }
      await spes.update({nom,description})
      return re
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }})
router.delete('/specialites/:id', async (req, res) => {
    try{
  const spes = await specialite.findByPK({where:{id:req.params.id}});

  if (!spes){
    return res.status(404).json({message:"Spécialité introuvable"})
  }
  await spes.delete();
  return res.status(200).json({message:"Spécialité supprimée avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})


// CRUD Département
router.post('/adddepartements', async (req, res) => {
  try {
    const { name, description , code, chef_departement_id, budget, statut, localisation, telephone, email, capacite_max } = req.body;
    if (!name || !description || !code || !chef_departement_id || !budget || !statut || !localisation || !telephone || !email || !capacite_max) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    const newdepartment = await departement.create({ name, description, code, chef_departement_id, budget, statut, localisation, telephone, email, capacite_max });
    res.status(201).json(newdepartment);
  }catch (error) {
    console.error('Error creating departement:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      const {nom,description,code,chef_departement_id,budget,statut,localisation,telephone,email,capacite_max}=req.body;
      const dep = await departement.findByPk({where:{id:req.params.id}});///departements/:id <---- //
      if(!dep){
        return res.status(404).json({message:"Département introuvable"})
      }
      await dep.update({nom,description,code,chef_departement_id,budget,statut,localisation,telephone,email,capacite_max})
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




// CRUD Niveau
router.post('/niveaux', async (req, res) => {
  try {
    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom du niveau est requis' });
    }
    const newNiveau = await niveau.create({ nom, description });
    res.status(201).json(newNiveau);
  } catch (error) {
    console.error('Error creating niveau:', error);
    res.status(500).json({ error: 'Internal server error' });
  }})
router.get('/niveaux', async (req, res) => {
    try {
      const niv = await niveau.findAll();  
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
      const niveau = await niveau.findByPK({where:{id:id}});
      if (!niveau){
        return res.status(404).json({error:"Niveau introuvable"})
      }
      return res.status(200).json(niveau);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
//update
router.put('/niveaux/:id', async (req, res) => {
  try{
      const {nom,description}=req.body;
      const niv = await niveau.findByPK({where:{id:req.params.id}});
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
  const niv = await niveau.findByPK({where:{id:id}});
  if (!niv){
    return res.status(404).json({message:"Niveau introuvable"})
  }
  await niv.destroy();
  return res.status(200).json({message:"Niveau supprimé avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})



// CRUD Classe
router.post('/classes', async (req, res) => {
  try {
    const { nom, description, effectif, niveau_id } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la classe est requis' });
    }
    if (!effectif) {
      return res.status(400).json({ error: 'L\'effectif est requis' });
    }
    if (!niveau_id) {
      return res.status(400).json({ error: 'Le niveau est requis' });
    }
    if (!description) {
      return res.status(400).json({ error: 'La description est requise' });
    }
    const newClasse = await Classe.create({ nom, description, effectif, niveau_id });
    if (newClasse) {
      console.log('Classe created successfully:', newClasse);
      return res.status(201).json(newClasse);
    }
    
  } catch (error) {
    console.error('Error creating classe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/classes', async (req, res) => {
    try {
      const classes = await classe.findAll();
      if (!classes) {
        return res.json({ message: "Aucune classe n'est disponible pour le moment" });
      }
      return res.status(200).json(classes);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
router.get('/classes/:id',async (req,res)=>{
    try {
      const id = req.params.id;
      if (!id){
        return res.status(400).json({error:"ID manquant"})
      }
      const classe = await classe.findByPK({where:{id:id}});
      if (!classe){
        return res.status(404).json({error:"Classe introuvable"})
      }
      return res.status(200).json(classe);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
//update
router.put('/classes/:id', async (req, res) => {
  try{
      const {nom,description}=req.body;
      const classe = await classe.findByPK({where:{id:req.params.id}});
      if(!classe){
        return res.status(404).json({message:"Classe introuvable"})
      }
      await classe.update({nom,description})
      return res.status(200).json({message:"Classe mise à jour avec succès"})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }
})
router.delete('/classes/:id', async (req, res) => {
    try{
  const id = req.params.id;
  const classe = await classe.findByPK({where:{id:id}});
  if (!classe){
    return res.status(404).json({message:"Classe introuvable"})
  }
  await classe.destroy();
  return res.status(200).json({message:"Classe supprimée avec succès"})
    }catch(error){
      return res.status(500).json({ error: 'Internal server error' });
    }})

// CRUD Salle
router.post('/salles', async (req, res) => {
  try {
    const { nom, type, capacite, localisation, description } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la salle est requis' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Le type de la salle est requis' });
    }
    if (!capacite) {
      return res.status(400).json({ error: 'La capacité est requise' });
    }
    const newSalle = await salle.create({ nom, type, capacite, localisation, description });
    res.status(201).json(newSalle);
  } catch (error) {
    console.error('Error creating salle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/salles', async (req, res) => {
  try {
    const salles = await salle.findAll();
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
    const { nom, type, capacite, localisation, description } = req.body;
    const salleToUpdate = await salle.findByPk(req.params.id);
    if (!salleToUpdate) {
      return res.status(404).json({ message: "Salle introuvable" });
    }
    await salleToUpdate.update({ nom, type, capacite, localisation, description });
    return res.status(200).json({ message: "Salle mise à jour avec succès" });
  } catch (error) {
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
    return res.status(500).json({ error: 'Internal server error' });
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
    const newMatiere = await matiere.create({ name, description, code, credits, niveauId });
    res.status(201).json(newMatiere);
  } catch (error) {
    console.error('Error creating matiere:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/matieres', async (req, res) => {
  try {
    const matieres = await matiere.findAll();
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

module.exports = router;

