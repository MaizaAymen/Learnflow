const express = require('express');
const router = express.Router();
const {specialite,departement} = require('../models');
const niveau = require('../models/Niveau');
const Classe = require('../models/Classe');
const salle = require('../models/Salle');
const matiere = require('../models/Matiere');
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