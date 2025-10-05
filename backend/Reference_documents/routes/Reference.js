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
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom du département est requis' });
    }
    const newdepartment = await departement.create({ name, description });
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
       return await departement.findByPK({where:{id:id}})
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
      
    }
    })
//update
router.put('/departements/:id', async (req, res) => {
  try{
      const {nom,description}=req.body;
      const dep = await departement.findByPK({where:{id:req.params.id}});///departements/:id <---- //
      if(!dep){
        return res.status(404).json({message:"Département introuvable"})
      }
      await dep.update({nom,description})
      return res.status(200).json({message:"Département mis à jour avec succès"})
  }catch(error){
    return res.status(500).json({ error: 'Internal server error' });
  }})
router.delete('/departements/:id', async (req, res) => {
    try{
  const id = req.params.id;
  const dep = await departement.findByPK({where:{id:id}});
  if (!dep){
    return res.status(404).json({message:"Département introuvable"})
  }
  await dep.delete();
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
    const { nom, description } = req.body;
    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la classe est requis' });
    }
    const newClasse = await classe.create({ nom, description });
    res.status(201).json(newClasse);
  } catch (error) {
    console.error('Error creating classe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})
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

module.exports = router;

