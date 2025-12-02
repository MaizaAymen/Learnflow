const express = require('express');
const router = express.Router();
const { Book, BookBorrowing, BookReservation } = require('../models');

// Middleware to check if book exists
const checkBookExists = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }
    req.book = book;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ===== GET ROUTES =====

// Get all available books with search and filter
router.get('/books', async (req, res) => {
  try {
    const { search, categorie } = req.query;
    let where = { statut: 'available' };

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { auteur: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categorie) {
      where.categorie = categorie;
    }

    const books = await Book.findAll({
      where,
      order: [['titre', 'ASC']]
    });

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
  }
});

// Get my borrowings
router.get('/my-borrowings', async (req, res) => {
  try {
    console.log('📌 /my-borrowings endpoint called');
    console.log('   req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('❌ User authentication check failed');
      return res.status(401).json({ error: 'User not authenticated', user: req.user });
    }
    
    const userId = req.user.id;
    console.log('✅ Fetching borrowings for user:', userId);
    const borrowings = await BookBorrowing.findAll({
      where: { userId },
      include: [{ model: Book, as: 'book', attributes: ['titre', 'auteur'] }],
      order: [['dateEmprunt', 'DESC']]
    });

    res.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des emprunts', details: error.message });
  }
});

// Get my reservations
router.get('/my-reservations', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const reservations = await BookReservation.findAll({
      where: { userId },
      include: [{ model: Book, as: 'book', attributes: ['titre', 'auteur'] }],
      order: [['dateReservation', 'DESC']]
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations', details: error.message });
  }
});

// Get single book details
router.get('/books/:bookId', checkBookExists, (req, res) => {
  res.json(req.book);
});

// ===== POST ROUTES =====

// Borrow a book
router.post('/borrow/:bookId', checkBookExists, async (req, res) => {
  try {
    const userId = req.user.id;
    const book = req.book;

    // Check if user already borrowed this book (not returned)
    const existingBorrowing = await BookBorrowing.findOne({
      where: {
        userId,
        bookId: book.id,
        statut: 'emprunte'
      }
    });

    if (existingBorrowing) {
      return res.status(400).json({ error: 'Vous avez déjà emprunté ce livre' });
    }

    // Check availability
    if (book.copiesDisponibles <= 0) {
      return res.status(400).json({ error: 'Livre non disponible' });
    }

    // Create borrowing record
    const dateRetourPrevue = new Date();
    dateRetourPrevue.setDate(dateRetourPrevue.getDate() + 14); // 2 weeks

    const borrowing = await BookBorrowing.create({
      userId,
      bookId: book.id,
      dateEmprunt: new Date(),
      dateRetourPrevue,
      statut: 'emprunte'
    });

    // Update book availability
    await book.update({
      copiesDisponibles: book.copiesDisponibles - 1
    });

    res.status(201).json({
      message: 'Livre emprunté avec succès',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'emprunt du livre' });
  }
});

// Return a book
router.post('/return/:borrowingId', async (req, res) => {
  try {
    const borrowing = await BookBorrowing.findByPk(req.params.borrowingId);
    if (!borrowing) {
      return res.status(404).json({ error: 'Emprunt non trouvé' });
    }

    if (borrowing.statut !== 'emprunte') {
      return res.status(400).json({ error: 'Ce livre n\'est pas actuellement emprunté' });
    }

    // Update borrowing
    await borrowing.update({
      statut: 'retourne',
      dateRetourEffective: new Date()
    });

    // Update book availability
    const book = await Book.findByPk(borrowing.bookId);
    await book.update({
      copiesDisponibles: book.copiesDisponibles + 1
    });

    res.json({
      message: 'Livre retourné avec succès',
      borrowing
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la restitution du livre' });
  }
});

// Reserve a book
router.post('/reserve/:bookId', checkBookExists, async (req, res) => {
  try {
    const userId = req.user.id;
    const book = req.book;

    // Check if already reserved
    const existingReservation = await BookReservation.findOne({
      where: {
        userId,
        bookId: book.id,
        statut: { [require('sequelize').Op.ne]: 'annulee' }
      }
    });

    if (existingReservation) {
      return res.status(400).json({ error: 'Vous avez déjà réservé ce livre' });
    }

    // Get position in queue
    const queuePosition = await BookReservation.count({
      where: {
        bookId: book.id,
        statut: 'en_attente'
      }
    }) + 1;

    const reservation = await BookReservation.create({
      userId,
      bookId: book.id,
      dateReservation: new Date(),
      positionQueue: queuePosition,
      statut: 'en_attente'
    });

    res.status(201).json({
      message: 'Livre réservé avec succès',
      reservation
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réservation du livre' });
  }
});

module.exports = router;
