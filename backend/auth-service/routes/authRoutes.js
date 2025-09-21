const express = require("express");
const sequelize = require("../config");
const utilisateur = require("../models/userModel");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const secretKey = "alex";

router.post("/register", async (req, res) => {
    try
{   
  const { nom, prenom, email, login, mdp, role, image, phone, bio } = req.body;
   const mdp_hash = await bcrypt.hash(mdp, 10);
  const newUser =await utilisateur.create({
    nom, prenom, email, login, mdp_hash, role, image, phone, bio
  });
  res.status(201).json(newUser);
}
 
catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur" });

}})

module.exports = router;



