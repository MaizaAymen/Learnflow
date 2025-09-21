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

router.post("/login", async (req, res) => {
    try {
      const { login, mdp } = req.body;
      const user = await utilisateur.findOne({where: { login }});
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const isPasswordValid = await bcrypt.compare(mdp, user.mdp_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, secretKey, {
        expiresIn: "1h",
      });
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la connexion de l'utilisateur" });
    }
  });

module.exports = router;



