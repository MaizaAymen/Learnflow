/**
 * Digital Library Service
 * Handles book uploads, downloads, and feedback
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/books');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/epub+zip', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, and TXT files are allowed.'));
    }
  }
});

/**
 * GET /api/library/books
 * Get all available books
 */
router.get('/books', authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT 
        b.id, b.title, b.author, b.description, b.isbn, b.category,
        b.file_size, b.created_at,
        u.nom as uploader_name,
        COUNT(DISTINCT bd.id) as download_count,
        AVG(bf.rating) as average_rating,
        COUNT(DISTINCT bf.id) as feedback_count
      FROM library_books b
      LEFT JOIN users u ON b.uploaded_by_id = u.id
      LEFT JOIN book_downloads bd ON b.id = bd.book_id
      LEFT JOIN book_feedback bf ON b.id = bf.book_id
      WHERE b.is_active = TRUE
    `;

    const params = [];
    
    if (category) {
      query += ` AND b.category = ?`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY b.id ORDER BY b.created_at DESC`;

    const [books] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books'
    });
  }
});

/**
 * GET /api/library/books/:id
 * Get single book details with feedback
 */
router.get('/books/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const bookQuery = `
      SELECT 
        b.id, b.title, b.author, b.description, b.isbn, b.category,
        b.file_size, b.created_at, b.uploaded_by_id,
        u.nom as uploader_name,
        COUNT(DISTINCT bd.id) as download_count,
        AVG(bf.rating) as average_rating
      FROM library_books b
      LEFT JOIN users u ON b.uploaded_by_id = u.id
      LEFT JOIN book_downloads bd ON b.id = bd.book_id
      LEFT JOIN book_feedback bf ON b.id = bf.book_id
      WHERE b.id = ? AND b.is_active = TRUE
      GROUP BY b.id
    `;

    const [books] = await pool.query(bookQuery, [id]);
    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const book = books[0];

    // Get feedback
    const [feedback] = await pool.query(`
      SELECT 
        bf.id, bf.rating, bf.comment, bf.created_at,
        u.nom as user_name, u.prenom as user_first_name
      FROM book_feedback bf
      LEFT JOIN users u ON bf.user_id = u.id
      WHERE bf.book_id = ?
      ORDER BY bf.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...book,
        feedback
      }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book details'
    });
  }
});

/**
 * POST /api/library/books
 * Upload a new book (admin only)
 */
router.post('/books', 
  authenticateToken,
  checkRole(['admin']),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const { title, author, description, isbn, category } = req.body;

      if (!title) {
        // Delete uploaded file if validation fails
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }

      const query = `
        INSERT INTO library_books 
        (title, author, description, isbn, file_path, file_name, file_size, mime_type, uploaded_by_id, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `;

      const [result] = await pool.query(query, [
        title,
        author || null,
        description || null,
        isbn || null,
        req.file.path,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        req.user.id,
        category || 'General'
      ]);

      res.status(201).json({
        success: true,
        message: 'Book uploaded successfully',
        data: {
          id: result.insertId,
          title,
          author,
          file_name: req.file.originalname,
          file_size: req.file.size
        }
      });
    } catch (error) {
      console.error('Error uploading book:', error);
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      res.status(500).json({
        success: false,
        error: 'Failed to upload book'
      });
    }
  }
);

/**
 * GET /api/library/download/:id
 * Download book file
 */
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [books] = await pool.query(
      'SELECT id, file_path, file_name FROM library_books WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const book = books[0];

    // Record download
    await pool.query(
      'INSERT INTO book_downloads (book_id, user_id) VALUES (?, ?)',
      [id, req.user.id]
    );

    // Send file
    res.download(book.file_path, book.file_name);
  } catch (error) {
    console.error('Error downloading book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download book'
    });
  }
});

/**
 * POST /api/library/feedback/:id
 * Add or update feedback for a book
 */
router.post('/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Check if book exists
    const [books] = await pool.query(
      'SELECT id FROM library_books WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Insert or update feedback
    const query = `
      INSERT INTO book_feedback (book_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      rating = ?, comment = ?, updated_at = NOW()
    `;

    await pool.query(query, [id, req.user.id, rating, comment || null, rating, comment || null]);

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/library/categories
 * Get all book categories
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, description FROM book_categories ORDER BY name'
    );

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * DELETE /api/library/books/:id
 * Delete a book (admin only)
 */
router.delete('/books/:id', 
  authenticateToken,
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [books] = await pool.query(
        'SELECT file_path FROM library_books WHERE id = ?',
        [id]
      );

      if (books.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      // Delete file from storage
      try {
        await fs.unlink(books[0].file_path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }

      // Mark as inactive instead of deleting
      await pool.query(
        'UPDATE library_books SET is_active = FALSE WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete book'
      });
    }
  }
);

module.exports = router;
