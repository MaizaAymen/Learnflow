const express = require("express");
const sequelize = require("../config");
const utilisateur = require("../models/userModel");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/mail");
const router = express.Router();
const secretKey = "alex";
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const XLSX = require("xlsx");
const { send } = require("process");
const NotificationClient = require("../../Service de Notifications/services/NotificationClient");

// Import models for automatic class assignment and student absence handling
const { Specialite, Niveau, Classe, Student } = require("../../Reference_documents/models");

// UUID generator for student absence records
const crypto = require('crypto');
const generateUUID = () => crypto.randomUUID();

// OTP Storage (use Redis in production)
const otpStore = new Map();

const upload = multer({ dest: "uploads/" });

/**
 * Helper function to extract teacher ID from Authorization header or cookies
 */
const getTeacherIdFromRequest = (req) => {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
    } catch (error) {
      console.error('Authorization header token verification error:', error.message);
    }
  }

  // Fall back to cookies
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.id;
    } catch (error) {
      console.error('Cookie token verification error:', error.message);
    }
  }

  return null;
};

// Helper function to auto-assign student to class based on specialite
async function autoAssignToClass(studentData) {
  try {
    const { nom, prenom, email, cin, specialite: specialiteName } = studentData;
    
    if (!specialiteName) {
      console.log(`⚠️ Pas de spécialité pour ${prenom} ${nom}`);
      return null;
    }

    // Find the specialite by name (case-insensitive)
    const specialite = await Specialite.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        sequelize.fn('LOWER', specialiteName)
      )
    });

    if (!specialite) {
      console.log(`⚠️ Spécialité "${specialiteName}" non trouvée pour ${prenom} ${nom}`);
      return null;
    }

    // Find classes for this specialite through niveau
    const niveaux = await Niveau.findAll({
      where: { specialite_id: specialite.id }
    });

    if (niveaux.length === 0) {
      console.log(`⚠️ Aucun niveau trouvé pour la spécialité "${specialiteName}"`);
      return null;
    }

    // Get all classes for these niveaux
    const classes = await Classe.findAll({
      where: {
        niveau_id: niveaux.map(n => n.id)
      },
      include: [{
        model: Niveau,
        as: 'niveau'
      }]
    });

    if (classes.length === 0) {
      console.log(`⚠️ Aucune classe trouvée pour la spécialité "${specialiteName}"`);
      return null;
    }

    // Count students in each class to find the one with least students
    const classesWithCounts = await Promise.all(
      classes.map(async (classe) => {
        const count = await Student.count({
          where: { classe_id: classe.id }
        });
        return { classe, count };
      })
    );

    // Sort by count (ascending) and pick the class with fewest students
    classesWithCounts.sort((a, b) => a.count - b.count);
    const targetClasse = classesWithCounts[0].classe;

    // Generate unique student number
    const studentCount = await Student.count();
    const numero_etudiant = `ETU${new Date().getFullYear()}${String(studentCount + 1).padStart(5, '0')}`;

    // Create student record in Reference_documents database
    const newStudent = await Student.create({
      nom,
      prenom,
      email,
      numero_etudiant,
      niveau_id: targetClasse.niveau_id,
      classe_id: targetClasse.id,
      statut: 'actif'
    });

    console.log(`✅ ${prenom} ${nom} assigné à la classe ${targetClasse.nom}`);
    
    return {
      classe: targetClasse.nom,
      niveau: targetClasse.niveau?.nom || 'N/A',
      specialite: specialiteName
    };
  } catch (error) {
    console.error(`❌ Erreur lors de l'assignation automatique:`, error);
    return null;
  }
}

// Universal upload endpoint that handles both CSV and Excel files
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier n'a été téléchargé" });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let results = [];

    console.log(`📁 Fichier reçu: ${req.file.originalname} (${fileExtension})`);

    // Handle Excel files (.xlsx, .xls)
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        results = XLSX.utils.sheet_to_json(worksheet);
        console.log(`📊 ${results.length} lignes trouvées dans le fichier Excel`);
      } catch (excelError) {
        console.error("Erreur lecture Excel:", excelError);
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: "Erreur lors de la lecture du fichier Excel" });
      }
      
      // Process students immediately for Excel
      let added = 0;
      let skipped = 0;
      let assigned = 0;
      const assignments = [];
      
      for (const student of results) {
        const { nom, prenom, email, cin, ville, specialite } = student;

        if (!email || !cin) {
          console.log(`⚠️ Ligne ignorée (manque email ou CIN): ${JSON.stringify(student)}`);
          skipped++;
          continue;
        }

        const existing = await utilisateur.findOne({ where: { email } });

        if (!existing) {
          const randomPassword = Math.random().toString(36).slice(-8);
          const hashed = await bcrypt.hash(randomPassword, 10);

          await utilisateur.create({
            nom,
            prenom,
            email,
            cin,
            mdp_hash: hashed,
            ville,
            specialite,
            role: "etudiant",
          });
          
          // Auto-assign to class based on specialite
          const assignmentInfo = await autoAssignToClass(student);
          if (assignmentInfo) {
            assigned++;
            assignments.push({
              nom: `${prenom} ${nom}`,
              ...assignmentInfo
            });
          }
          
          sendEmail({
            to: email,
            subject: "Bienvenue sur Learnflow !",
            text: `Bonjour ${prenom},
              Bienvenue sur Learnflow !
              Nous vous remercions chaleureusement pour votre inscription en tant qu'étudiant. 
              Nous sommes ravis de vous compter parmi notre communauté d'apprentissage.
              ${assignmentInfo ? `\nVous avez été assigné à la classe: ${assignmentInfo.classe} (${assignmentInfo.specialite})` : ''}
              À très bientôt sur Learnflow !
              Votre mot de passe temporaire est : ${randomPassword}
              Cordialement,
              Aymen Maiza
              Fondateur de Learnflow`,
          }).catch(err => console.error("Erreur email:", err));

          console.log(`✅ Étudiant ajouté: ${prenom} ${nom}`);
          added++;
        } else {
          console.log(`⚠️ Étudiant déjà existant: ${prenom} ${nom}`);
          skipped++;
        }
      }
      
      fs.unlinkSync(filePath);
      res.json({ 
        message: `Importation terminée avec succès ✅ (${added} ajoutés, ${skipped} ignorés, ${assigned} assignés automatiquement)`,
        added,
        skipped,
        assigned,
        assignments
      });
      
    } else if (fileExtension === 'csv') {
      // Handle CSV files
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          console.log(`📊 ${results.length} lignes trouvées dans le fichier CSV`);
          
          let added = 0;
          let skipped = 0;
          let assigned = 0;
          const assignments = [];
          
          for (const student of results) {
            const { nom, prenom, email, cin, ville, specialite } = student;

            if (!email || !cin) {
              console.log(`⚠️ Ligne ignorée (manque email ou CIN): ${JSON.stringify(student)}`);
              skipped++;
              continue;
            }

            const existing = await utilisateur.findOne({ where: { email } });

            if (!existing) {
              const randomPassword = Math.random().toString(36).slice(-8);
              const hashed = await bcrypt.hash(randomPassword, 10);

              await utilisateur.create({
                nom,
                prenom,
                email,
                cin,
                mdp_hash: hashed,
                ville,
                specialite,
                role: "etudiant",
              });
              
              // Auto-assign to class based on specialite
              const assignmentInfo = await autoAssignToClass(student);
              if (assignmentInfo) {
                assigned++;
                assignments.push({
                  nom: `${prenom} ${nom}`,
                  ...assignmentInfo
                });
              }
              
              sendEmail({
                to: email,
                subject: "Bienvenue sur Learnflow !",
                text: `Bonjour ${prenom},
                  Bienvenue sur Learnflow !
                  Nous vous remercions chaleureusement pour votre inscription en tant qu'étudiant. 
                  Nous sommes ravis de vous compter parmi notre communauté d'apprentissage.
                  ${assignmentInfo ? `\nVous avez été assigné à la classe: ${assignmentInfo.classe} (${assignmentInfo.specialite})` : ''}
                  À très bientôt sur Learnflow !
                  Votre mot de passe temporaire est : ${randomPassword}
                  Cordialement,
                  Aymen Maiza
                  Fondateur de Learnflow`,
              }).catch(err => console.error("Erreur email:", err));

              console.log(`✅ Étudiant ajouté: ${prenom} ${nom}`);
              added++;
            } else {
              console.log(`⚠️ Étudiant déjà existant: ${prenom} ${nom}`);
              skipped++;
            }
          }

          fs.unlinkSync(filePath); 
          res.json({ 
            message: `Importation terminée avec succès ✅ (${added} ajoutés, ${skipped} ignorés, ${assigned} assignés automatiquement)`,
            added,
            skipped,
            assigned,
            assignments
          });
        })
        .on("error", (error) => {
          console.error("Erreur lecture CSV:", error);
          fs.unlinkSync(filePath);
          res.status(500).json({ error: "Erreur lors de la lecture du fichier CSV" });
        });
    } else {
      fs.unlinkSync(filePath);
      res.status(400).json({ error: "Format de fichier non supporté. Utilisez .csv, .xlsx ou .xls" });
    }
  } catch (error) {
    console.error("Erreur upload:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Erreur lors de l'importation du fichier: " + error.message });
  }
});

router.post("/upload-students", upload.single("file"), async (req, res) => {
  // Redirect to the main upload-csv endpoint
  return router.post("/upload-csv")(req, res);
});



router.post("/student-signup", async (req, res) => {
  try {
    const { cin, email } = req.body;

    if (!cin || !email) {
      return res.status(400).json({ error: "CIN et email sont requis" });
    }

    // Vérifie si l'étudiant existe déjà (dans la base importée par admin)
    const existingUser = await utilisateur.findOne({ where: { cin, email, role: "etudiant" } });

    if (!existingUser) {
      return res.status(404).json({ error: "CIN ou email introuvable" });
    }

    // Génère un mot de passe aléatoire
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Met à jour le mot de passe dans la base
    await existingUser.update({ mdp_hash: hashedPassword });

    // Envoie un email au student avec le mot de passe
    await sendEmail({
      to: email,
      subject: "Votre compte Learnflow est prêt 🎓",
      html: `
        <p>Bonjour ${existingUser.prenom},</p>
        <p>Votre compte Learnflow a été activé avec succès.</p>
        <p>Voici vos identifiants :</p>
        <ul>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Mot de passe :</strong> ${randomPassword}</li>
        </ul>
        <p>Veuillez vous connecter et changer votre mot de passe dès que possible.</p>
        <p>Bien à vous,<br>L'équipe Learnflow</p>
      `
    });

    res.json({ message: "Un mot de passe vous a été envoyé par email." });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur lors de la création du compte" });
  }
});


router.post("/register", async (req, res) => {
    try
{   
  const { nom, prenom, email, mdp, password, role, image, phone, bio ,specialite, ville} = req.body;
  
  // Support both 'mdp' and 'password' field names
  const motDePasse = mdp || password;
  
if (!nom) {
  return res.status(400).json({ error: "Le champ 'nom' est obligatoire" });
}

if (!prenom) {
  return res.status(400).json({ error: "Le champ 'prenom' est obligatoire" });
}

if (!email) {
  return res.status(400).json({ error: "Le champ 'email' est obligatoire" });
}

if (!motDePasse) {
  return res.status(400).json({ error: "Le champ 'mot de passe' est obligatoire" });
}

if (!role) {
  return res.status(400).json({ error: "Le champ 'role' est obligatoire" });
}

  // Note: specialite and ville are optional - only validate if provided from auth form
  const mawjoud = await utilisateur.findOne({where: {email}})
  if (mawjoud) {
    return res.status(409).json({ error: "Email déjà utilisé" });}
   const mdp_hash = await bcrypt.hash(motDePasse, 10);
  const newUser =await utilisateur.create({
    nom, prenom, email,  mdp_hash, role, image, phone, bio, specialite, ville
  });
  sendEmail({
   to: email,
subject: "Bienvenue sur Learnflow !",
text: `Bonjour ${prenom},

Bienvenue sur Learnflow !

Nous vous remercions chaleureusement pour votre inscription en tant que ${role}. 
Nous sommes ravis de vous compter parmi notre communauté d'apprentissage.

À très bientôt sur Learnflow !

Cordialement,
Aymen Maiza
Fondateur de Learnflow`,
html: `
  <p>Bonjour ${prenom},</p>
  <p>Bienvenue sur <strong>Learnflow</strong> !</p>
  <p>Nous vous remercions chaleureusement pour votre inscription en tant que <strong>${role}</strong>. 
  Nous sommes ravis de vous compter parmi notre communauté d'apprentissage.</p>
  <p>À très bientôt sur Learnflow !</p>
  <p>Cordialement,<br><strong>Aymen Maiza</strong><br>Fondateur de Learnflow</p>
`,

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
        html:`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Alerte de connexion - Learnflow</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #1e88e5, #42a5f5);
      text-align: center;
      padding: 25px;
    }

    .header img {
      width: 120px;
      height: auto;
    }

    .content {
      padding: 35px 30px;
      color: #333333;
      font-size: 16px;
      line-height: 1.7;
    }

    .content h2 {
      color: #1e88e5;
      font-size: 24px;
      margin-bottom: 15px;
    }

    .content p {
      margin-bottom: 15px;
    }

    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #1e88e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin-top: 20px;
      transition: background 0.3s;
    }

    .button:hover {
      background-color: #1565c0;
    }

    .footer {
      background-color: #f2f4f7;
      text-align: center;
      padding: 18px;
      font-size: 14px;
      color: #666666;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 600px) {
      .content {
        padding: 25px 20px;
      }

      .content h2 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i0.wp.com/yoursmartclass.com/wp-content/uploads/2024/11/LEARNING-PROCESS.jpg?fit=820%2C460&ssl=1" alt="Learnflow Sécurité">
    </div>
    <div class="content">
      <h2>Bonjour ${user.prenom},</h2>
      <p>
        Nous avons détecté une <strong>nouvelle connexion</strong> à votre compte <strong>Learnflow</strong>.
      </p>
      <p>
        Si c'était bien vous, vous pouvez ignorer cet email.  
        Sinon, veuillez <strong>sécuriser votre compte immédiatement</strong> afin de protéger vos informations.
      </p>
      <a href="https://learnflow.com/security" class="button">🔒 Sécuriser mon compte</a>
    </div>
    <div class="footer">
      <p>Cordialement,<br><strong>L'équipe Learnflow</strong></p>
      <p style="font-size: 12px; color: #999;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
`
      }).catch((err) => console.error("Erreur lors de l'envoi de l'email:", err));
      
      // Create JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, secretKey, {
        expiresIn: "1h",
      });
      
      // Set httpOnly cookie (for same-domain requests)
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60*60 // 1 hour
      });
      
      // Return token and user data in response body for cross-domain requests
      return res.status(200).json({ 
        message: "Connexion réussie",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      });

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
      //const token = authHeader.split(" ")[1]; //Since you're using cookies, you don't need authHeader[1] — that's only for Authorization: Bearer <token> headers. You can read the token directly from req.cookies.token.
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

// Generic users endpoint with role filtering (for frontend compatibility)
router.get("/users", async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    const users = await utilisateur.findAll({ 
      where,
      attributes: ['id', 'nom', 'prenom', 'email', 'role', 'phone', 'specialite', 'classe_id']
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});
router.delete("/deleteuser/:id", async (req, res) => {
      try{
        const {id}=req.params;
        const user=await utilisateur.findByPk(id);
        if (user) {
      await user.destroy();
      return res.status(200).json({ message: "Utilisateur supprimé avec succès" }); 
    } else {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

      }catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
      }})

router.put("/updateuser/:id", async (req, res) => {
        try{
          const {id}=req.params;
          const { nom, prenom, email, mdp, password, role, phone, bio, specialite, ville } = req.body;
          const user=await utilisateur.findByPk(id);
          if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
          }
          

          const updateData = { nom, prenom, email, role, phone, bio, specialite, ville };
    
          const motDePasse = mdp || password;
          let passwordChanged = false;
          
          if (motDePasse) {
            updateData.mdp_hash = await bcrypt.hash(motDePasse, 10);
            passwordChanged = true;
          }
          
          await user.update(updateData);
          
          // 📢 Send notification if password was changed
          if (passwordChanged) {
            try {
              await NotificationClient.notifyPasswordChanged(id, user.prenom || 'User');
            } catch (notifError) {
              console.warn('⚠️ Could not send password change notification:', notifError.message);
              // Don't fail the update if notification fails
            }
          }
          
          sendEmail({
            to: email,
            subject: "Mise à jour de votre compte Learnflow",
            text: `Votre compte a été mis à jour avec succès. avec une novelle information. 
            nom: ${nom}
            prenom: ${prenom}
            mot de passe ${motDePasse} 
            email ${email}
            role: ${role}
            Cordialement,
            L'équipe Learnflow`,
          }).catch((err) => console.error("Erreur lors de l'envoi de l'email:", err));
          return res.status(200).json({ message: "Utilisateur mis à jour avec succès" });

        }catch (error) {
          res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
        }
      });

// Bulk assign students to a class
router.post("/assign-students-to-class", async (req, res) => {
  try {
    const { studentIds, classeId } = req.body;

    console.log('📥 ASSIGN TO CLASS REQUEST (Auth Service):', { studentIds, classeId });

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      console.log('❌ Invalid studentIds:', studentIds);
      return res.status(400).json({ error: 'Invalid studentIds provided' });
    }

    if (!classeId) {
      console.log('❌ Missing classeId');
      return res.status(400).json({ error: 'classeId is required' });
    }

    // Verify the class exists in referentiels
    const classe = await Classe.findByPk(classeId);
    console.log('🔍 Class found:', classe ? classe.nom : 'NOT FOUND');
    
    if (!classe) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if students exist before updating
    const existingStudents = await utilisateur.findAll({
      where: {
        id: studentIds,
        role: 'etudiant'
      }
    });
    
    console.log('🔍 Students found:', existingStudents.length, 'out of', studentIds.length);
    
    if (existingStudents.length === 0) {
      return res.status(404).json({ 
        error: 'No matching students found',
        details: 'Students may not exist or are not marked as etudiant'
      });
    }

    // Update all students with the new class assignment
    const [updatedCount] = await utilisateur.update(
      { classe_id: classeId },
      {
        where: {
          id: studentIds,
          role: 'etudiant'
        }
      }
    );

    console.log('✅ Updated count:', updatedCount);

    res.json({
      message: `${updatedCount} student(s) assigned successfully`,
      assignedCount: updatedCount
    });

  } catch (error) {
    console.error('❌ Error assigning students:', error);
    res.status(500).json({ error: 'Failed to assign students', details: error.message });
  }
});

/**
 * GET /api/auth/classes/:classId/students
 * Get all students in a specific class
 * Used by StudentAbsenceModal to fetch class students
 */
router.get('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    // Verify the class exists
    const classe = await Classe.findByPk(classId);
    if (!classe) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Get all students (Users with role='etudiant') assigned to this class
    const students = await utilisateur.findAll({
      where: {
        classe_id: classId,
        role: 'etudiant'
      },
      attributes: ['id', 'nom', 'prenom', 'email', 'numero_etudiant'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']]
    });

    console.log(`✅ Found ${students.length} students in class ${classId}`);
    res.json(students || []);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

/**
 * GET /api/auth/student/absences
 * Get all absences for the authenticated student
 */
router.get('/student/absences', async (req, res) => {
  try {
    console.log('🚨 GET /student/absences called!');
    
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Decode token to get student ID
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token invalide' });
      }

      const studentId = decoded.id;
      console.log('📝 Fetching absences for student ID:', studentId);

      // Forward the request to the Reference_documents service
      const referenceServiceUrl = `http://localhost:3000/api/student/absences/${studentId}`;
      console.log(`📤 Forwarding request to Reference service: ${referenceServiceUrl}`);

      try {
        const response = await fetch(referenceServiceUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('❌ Reference service returned error:', response.status);
          return res.status(response.status).json({ error: 'Failed to fetch absences from reference service' });
        }

        const data = await response.json();
        console.log('✅ Successfully fetched student absences:', data?.length || 0);
        res.json(data);

      } catch (fetchError) {
        console.error('❌ Error calling reference service:', fetchError.message);
        // If reference service is down, return empty array
        res.json([]);
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /student/absences:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/teacher/mark-student-absences
 * Mark attendance/absence for multiple students in a lesson
 * Proxies the request to the Reference_documents service on port 3000
 */
router.post('/teacher/mark-student-absences', async (req, res) => {
  console.log('🚨 POST /teacher/mark-student-absences called (Auth Service)!');
  
  try {
    const token = req.headers.authorization;
    const { schedule_id, absences } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('📝 Request data:', { schedule_id, absenceCount: absences?.length });

    // Forward the request to the Reference_documents service
    const referenceServiceUrl = 'http://localhost:3000/api/teacher/mark-student-absences';
    console.log(`📤 Forwarding request to Reference service: ${referenceServiceUrl}`);

    const response = await fetch(referenceServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        schedule_id,
        absences
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Reference service error:', error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    console.log('✅ Successfully marked student absences:', data);
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Error in POST /teacher/mark-student-absences:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FORGOT PASSWORD - OTP FLOW
// ============================================

/**
 * POST /api/auth/forgot-password
 * Request OTP for password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await utilisateur.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        message: 'If an account with this email exists, an OTP has been sent',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiryTime,
      attempts: 0,
      verified: false,
    });

    console.log(`🔐 OTP generated for ${email}: ${otp}`);

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Your LearnFlow Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>OTP - LearnFlow</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fb; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 14px; box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #1e88e5, #42a5f5); text-align: center; padding: 25px; color: white; }
            .content { padding: 35px 30px; color: #333333; font-size: 16px; line-height: 1.7; }
            .otp-code { background-color: #f0f2f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code p { font-size: 28px; font-weight: bold; color: #1e88e5; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace; }
            .warning { background-color: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 15px 0; font-size: 14px; }
            .footer { background-color: #f2f4f7; text-align: center; padding: 18px; font-size: 14px; color: #666666; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.prenom},</h2>
              <p>You requested to reset your password. Here is your One-Time Password (OTP):</p>
              <div class="otp-code">
                <p>${otp}</p>
              </div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request this, please ignore this email. Your account security is important to us.
              </div>
              <p>Use this OTP to reset your password on LearnFlow.</p>
            </div>
            <div class="footer">
              <p>Cordialement,<br><strong>L'équipe LearnFlow</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(err => console.error('❌ Error sending OTP email:', err));

    res.status(200).json({
      message: 'OTP sent successfully to your email',
      email: email.replace(/(.{2})(.*)(.{2})/, '$1***$3'), // Mask email
    });

  } catch (error) {
    console.error('❌ Error in forgot-password:', error);
    res.status(500).json({ message: 'Error sending OTP. Please try again.' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if OTP exists
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    // Check OTP expiry
    if (new Date() > storedOtpData.expiryTime) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Increment attempts
    storedOtpData.attempts += 1;
    if (storedOtpData.attempts > 5) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP' });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as verified
    storedOtpData.verified = true;

    console.log(`✅ OTP verified for ${email}`);

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true,
    });

  } catch (error) {
    console.error('❌ Error in verify-otp:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with verified OTP
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must contain uppercase, lowercase, and numbers',
      });
    }

    // Check if OTP is verified
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData || !storedOtpData.verified) {
      return res.status(400).json({ message: 'OTP not verified. Please verify OTP first.' });
    }

    // Find user
    const user = await utilisateur.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = 10;
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await user.update({ mdp_hash: hashedPassword });

    // Send password changed email
    await sendEmail({
      to: email,
      subject: 'Your LearnFlow Password Has Been Changed',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Password Changed - LearnFlow</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fb; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 14px; box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #28a745, #51cf66); text-align: center; padding: 25px; color: white; }
            .content { padding: 35px 30px; color: #333333; font-size: 16px; line-height: 1.7; }
            .warning { background-color: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 15px 0; font-size: 14px; }
            .footer { background-color: #f2f4f7; text-align: center; padding: 18px; font-size: 14px; color: #666666; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.prenom},</h2>
              <p>Your password has been successfully changed.</p>
              <div class="warning">
                If you did not make this change, please contact support immediately.
              </div>
              <p>You can now login with your new password.</p>
            </div>
            <div class="footer">
              <p>Cordialement,<br><strong>L'équipe LearnFlow</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(err => console.error('❌ Error sending password changed email:', err));

    // Clear OTP
    otpStore.delete(email);

    console.log(`✅ Password reset successfully for ${email}`);

    res.status(200).json({
      message: 'Password reset successfully. You can now login with your new password.',
    });

  } catch (error) {
    console.error('❌ Error in reset-password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await utilisateur.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message: 'If an account with this email exists, an OTP has been sent',
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiryTime,
      attempts: 0,
      verified: false,
    });

    console.log(`🔐 OTP resent for ${email}: ${otp}`);

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: 'Your LearnFlow Password Reset OTP (Resend)',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>OTP - LearnFlow</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fb; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 14px; box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #1e88e5, #42a5f5); text-align: center; padding: 25px; color: white; }
            .content { padding: 35px 30px; color: #333333; font-size: 16px; line-height: 1.7; }
            .otp-code { background-color: #f0f2f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code p { font-size: 28px; font-weight: bold; color: #1e88e5; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace; }
            .warning { background-color: #fff3cd; padding: 12px; border-left: 4px solid #ffc107; margin: 15px 0; font-size: 14px; }
            .footer { background-color: #f2f4f7; text-align: center; padding: 18px; font-size: 14px; color: #666666; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset (Resent)</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.prenom},</h2>
              <p>Here is your new One-Time Password (OTP):</p>
              <div class="otp-code">
                <p>${otp}</p>
              </div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request this, please ignore this email.
              </div>
            </div>
            <div class="footer">
              <p>Cordialement,<br><strong>L'équipe LearnFlow</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    }).catch(err => console.error('❌ Error sending resend OTP email:', err));

    res.status(200).json({
      message: 'OTP resent successfully',
    });

  } catch (error) {
    console.error('❌ Error in resend-otp:', error);
    res.status(500).json({ message: 'Error resending OTP' });
  }
});

// Cleanup expired OTPs every minute
setInterval(() => {
  const now = new Date();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiryTime) {
      otpStore.delete(email);
      console.log(`🧹 Cleaned up expired OTP for ${email}`);
    }
  }
}, 60000);

module.exports = router;
