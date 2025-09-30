const express = require("express");
const sequelize = require("../config");
const utilisateur = require("../models/userModel");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/mail");
const router = express.Router();
const secretKey = "alex";


router.post("/register", async (req, res) => {
    try
{   
  const { nom, prenom, email, login, mdp, role, image, phone, bio } = req.body;
  if (!nom || !prenom || !email || !login || !mdp || !role) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }
  const mawjoud =utilisateur.findOne({where: {email}})
  if (mawjoud) {
    return res.status(409).json({ error: "Email déjà utilisé" });}
   const mdp_hash = await bcrypt.hash(mdp, 10);
  const newUser =await utilisateur.create({
    nom, prenom, email, login, mdp_hash, role, image, phone, bio
  });
  sendEmail({
    to: email,
    subject: "Bienvenue sur Learnflow!",
    text: `Bonjour ${prenom},\n\nMerci de vous être inscrit sur Learnflow en tant que ${role}.\n\nCordialement,\nL'équipe Learnflow`,
    html: `<p>Bonjour ${prenom},</p><p>Merci de vous être inscrit sur Learnflow en tant que <strong>${role}</strong>.</p><p>Cordialement,<br>L'équipe Learnflow</p>`,
  }).catch((err) => console.error("Erreur lors de l'envoi de l'email:", err));
  //
  res.status(201).json(newUser);
  
}
 
catch (error) {
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'utilisateur" });

}})
router.post("/completeprofile", async (req, res) => {
  try { 
    const { id, cin, certification, date_naissance, classes, specialite, departement, etablissement, adresse, ville, pays, niveau_etude, parcours, interets, competences } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    const user = await utilisateur.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    await user.update({
      cin,
      certification,
      date_naissance,
      classes,
      specialite,
      departement,
      etablissement,
      adresse,
      ville,
      pays,
      niveau_etude,
      parcours,
      interets,
      competences
    });
    res.status(200).json({ message: "Profil complété avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la complétion du profil" });
  }
});
router.post("/login", async (req, res) => {
    try {
      const { email, mdp } = req.body;
      const user = await utilisateur.findOne({where: { email }});
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const isPasswordValid = await bcrypt.compare(mdp, user.mdp_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }
      sendEmail({
        to: email,
        subject: "Nouvelle connexion à votre compte Learnflow",
        text: `Bonjour ${user.prenom},\n\nNous avons détecté une nouvelle connexion à votre compte Learnflow.\n\nSi 
        c'était vous, vous pouvez ignorer cet email. Sinon, veuillez sécuriser votre compte immédiatement.
        \n\nCordialement,\nL'équipe Learnflow`,
      }).catch((err) => console.error("Erreur lors de l'envoi de l'email:", err));
      const token = jwt.sign({ id: user.id, role: user.role }, secretKey, {
        expiresIn: "1h",
      });
      res.cookie("token",token,{httpOnly:true,secure:false,maxAge:1000*60*60}); //1h
      //res.status(200).json({ token }); without cookie

      return res.status(200).json({ message: "Connexion réussie" });

    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la connexion de l'utilisateur" });
    }
  });
router.get("/profile", async (req, res) => {
    try {
      const authHeader = req.cookies.token;
      if (!authHeader) {
        return res.status(401).json({ error: "Token d'authentification manquant" });
      }
      //const token = authHeader.split(" ")[1]; //Since you’re using cookies, you don’t need authHeader[1] — that’s only for Authorization: Bearer <token> headers. You can read the token directly from req.cookies.token.
      const token = authHeader;
      jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Token invalide" });
        }

        const user = await utilisateur.findByPk(decoded.id);//hiya nafsha findById Difference:findByPk = the current and correct method (works with any column defined as primary key, not just id).//findById = deprecated old alias for findByPk, only used for backward compatibility in old Sequelize projects.
        if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json({ user });
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du profil" });
    }
  });
router.get("/getAllUsers", async (req, res) => {
    try {
      const user = await utilisateur.findAll();
      res.status(200).json(user);
    }catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération du profil" });
    }});
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Déconnexion réussie" });
});
router.get("/getallstudents", async (req, res) => {{
  try
  {
    const students = await utilisateur.findAll({where:{role:'etudiant'}})
    res.status(200).json(students);
  }catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des étudiants" });
  }
}});
router.get("/getallenseignants", async (req, res) => {{
    try{
      const masters= await utilisateur.findAll({where:{role:'enseignant'}})
      res.status(200).json(masters);  
    
    }catch (error) {
      res.status(500).json({ error: "Erreur lors de la récupération des enseignants" });
    }}});
module.exports = router;


