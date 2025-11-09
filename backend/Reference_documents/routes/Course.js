const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Matiere = require('../models/Matiére');
const User = require('../../auth-service/models/userModel');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['matiereId', 'ASC'], ['order', 'ASC']]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by matiere ID
router.get('/matiere/:matiereId', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { matiereId: req.params.matiereId },
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['order', 'ASC']]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get courses by teacher/user ID
router.get('/teacher/:userId', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { userId: req.params.userId },
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { title, description, content, videoUrl, documentUrl, duration, order, isPublished, matiereId, userId } = req.body;
    
    // Validate required fields
    if (!title || !matiereId || !userId) {
      return res.status(400).json({ error: 'Title, matiereId, and userId are required' });
    }
    
    // Check if matiere exists
    const matiere = await Matiere.findByPk(matiereId);
    if (!matiere) {
      return res.status(404).json({ error: 'Matiere not found' });
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const course = await Course.create({
      title,
      description,
      content,
      videoUrl,
      documentUrl,
      duration,
      order,
      isPublished,
      matiereId,
      userId
    });
    
    const createdCourse = await Course.findByPk(course.id, {
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });
    
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const { title, description, content, videoUrl, documentUrl, duration, order, isPublished, matiereId, userId } = req.body;
    
    // Validate matiere if it's being updated
    if (matiereId && matiereId !== course.matiereId) {
      const matiere = await Matiere.findByPk(matiereId);
      if (!matiere) {
        return res.status(404).json({ error: 'Matiere not found' });
      }
    }
    
    // Validate user if it's being updated
    if (userId && userId !== course.userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }
    
    await course.update({
      title: title || course.title,
      description: description !== undefined ? description : course.description,
      content: content !== undefined ? content : course.content,
      videoUrl: videoUrl !== undefined ? videoUrl : course.videoUrl,
      documentUrl: documentUrl !== undefined ? documentUrl : course.documentUrl,
      duration: duration !== undefined ? duration : course.duration,
      order: order !== undefined ? order : course.order,
      isPublished: isPublished !== undefined ? isPublished : course.isPublished,
      matiereId: matiereId || course.matiereId,
      userId: userId || course.userId
    });
    
    const updatedCourse = await Course.findByPk(course.id, {
      include: [
        { model: Matiere, as: 'matiere' },
        { model: User, as: 'enseignant', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    await course.destroy();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
