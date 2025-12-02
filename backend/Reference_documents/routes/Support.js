const express = require('express');
const router = express.Router();
const { HelpDesk, HelpDeskMessage, FAQ } = require('../models');

// Generate ticket number
const generateTicketNumber = async () => {
  const count = await HelpDesk.count();
  return `TKT-${Date.now()}-${count + 1}`;
};

// ===== HELP DESK ROUTES =====

// Get my tickets
router.get('/my-tickets', async (req, res) => {
  try {
    console.log('📌 /my-tickets endpoint called');
    console.log('   req.user:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('❌ User authentication check failed');
      return res.status(401).json({ error: 'User not authenticated', user: req.user });
    }
    
    const userId = req.user.id;
    console.log('✅ Fetching tickets for user:', userId);
    
    const tickets = await HelpDesk.findAll({
      where: { userId },
      order: [['dateCreation', 'DESC']]
    });

    console.log('✅ Found tickets:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('❌ Error fetching tickets:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets', details: error.message });
  }
});

// Get ticket by ID with messages
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await HelpDesk.findByPk(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    const messages = await HelpDeskMessage.findAll({
      where: { ticketId: ticket.id },
      order: [['dateMessage', 'ASC']]
    });

    res.json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
  }
});

// Get all tickets (admin only)
router.get('/admin/tickets', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent voir tous les tickets.' });
    }

    const { statut, categorie, priorite } = req.query;
    let where = {};

    if (statut) where.statut = statut;
    if (categorie) where.categorie = categorie;
    if (priorite) where.priorite = priorite;

    const tickets = await HelpDesk.findAll({
      where,
      order: [['dateCreation', 'DESC']],
      limit: 50
    });

    res.json({ total: tickets.length, tickets });
  } catch (error) {
    console.error('❌ Error fetching admin tickets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets', details: error.message });
  }
});

// Create new ticket
router.post('/tickets', async (req, res) => {
  try {
    // ===== DEBUGGING LOGS =====
    console.log('\n🔍 POST /api/support/tickets - DEBUGGING');
    console.log('📤 Request Headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'MISSING'
    });
    console.log('📤 RAW Request Body:', req.body);
    console.log('📤 Request Body Keys:', Object.keys(req.body));
    console.log('📤 Request Body JSON:', JSON.stringify(req.body, null, 2));
    console.log('👤 req.user:', req.user);
    
    // ===== VALIDATION =====
    // Check authentication
    if (!req.user) {
      console.error('❌ VALIDATION FAILED: req.user is undefined');
      return res.status(401).json({ 
        error: 'Not authenticated', 
        details: 'req.user is undefined - authentication middleware may not have run'
      });
    }

    if (!req.user.id) {
      console.error('❌ VALIDATION FAILED: req.user.id is missing');
      return res.status(401).json({ 
        error: 'Invalid user data',
        details: 'req.user.id is undefined'
      });
    }

    const { titre, description, categorie, priorite } = req.body;
    const userId = req.user.id;

    console.log('✅ User authenticated - ID:', userId);
    console.log('📋 Form fields:', { titre, description, categorie, priorite });

    // Check required fields
    if (!titre) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: 'titre is required' 
      });
    }
    if (!description) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'description is required'
      });
    }
    if (!categorie) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'categorie is required'
      });
    }

    // Validate field types and values
    if (typeof titre !== 'string' || titre.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'titre must be a non-empty string'
      });
    }
    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'description must be a non-empty string'
      });
    }

    const validCategories = ['technique', 'academique', 'administratif', 'autre'];
    if (!validCategories.includes(categorie)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: `categorie must be one of: ${validCategories.join(', ')}`
      });
    }

    const validPriorities = ['basse', 'normale', 'haute', 'urgente'];
    const priorityValue = priorite || 'normale';
    if (!validPriorities.includes(priorityValue)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: `priorite must be one of: ${validPriorities.join(', ')}`
      });
    }

    // ===== CREATE TICKET =====
    console.log('🔧 Creating ticket with data:', { 
      userId, 
      titre: titre.substring(0, 30), 
      categorie, 
      priorite: priorityValue 
    });

    const numeroTicket = await generateTicketNumber();
    console.log('📌 Generated ticket number:', numeroTicket);

    // Prepare data for insertion - ONLY include fields that HelpDesk model expects
    const ticketData = {
      numeroTicket,
      userId,
      titre: titre.trim(),
      description: description.trim(),
      categorie,
      priorite: priorityValue,
      statut: 'ouvert',
      dateCreation: new Date()
      // DO NOT pass any other fields - Ant Design might send extra internal fields
    };
    
    console.log('🔍 Ticket data before create:', JSON.stringify(ticketData, null, 2));
    console.log('🔍 Data types:', {
      numeroTicket: typeof numeroTicket,
      userId: typeof userId,
      titre: typeof titre,
      description: typeof description,
      categorie: typeof categorie,
      priorite: typeof priorityValue,
      dateCreation: typeof new Date()
    });

    const ticket = await HelpDesk.create(ticketData);

    console.log('✅ Ticket created successfully - ID:', ticket.id);

    res.status(201).json({
      message: 'Ticket créé avec succès',
      ticket: {
        id: ticket.id,
        numeroTicket: ticket.numeroTicket,
        titre: ticket.titre,
        statut: ticket.statut,
        categorie: ticket.categorie,
        priorite: ticket.priorite,
        dateCreation: ticket.dateCreation
      }
    });
  } catch (error) {
    console.error('❌ ERROR creating ticket:', error.message);
    console.error('   Stack trace:', error.stack);
    console.error('   Error details:', error);
    
    res.status(500).json({ 
      error: 'Erreur lors de la création du ticket',
      details: error.message,
      type: error.name
    });
  }
});

// Update ticket status
router.patch('/tickets/:ticketId/status', async (req, res) => {
  try {
    const { statut } = req.body;
    const ticket = await HelpDesk.findByPk(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    await ticket.update({
      statut,
      dateResolution: statut === 'resolu' ? new Date() : null
    });

    res.json({ message: 'Ticket mis à jour', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du ticket' });
  }
});

// Add message to ticket (student or admin)
router.post('/tickets/:ticketId/messages', async (req, res) => {
  try {
    const { contenu } = req.body;
    const ticketId = req.params.ticketId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const ticket = await HelpDesk.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    // Determine message author type based on user role
    let typeAuteur = 'student';
    if (userRole === 'admin' || userRole === 'support') {
      typeAuteur = 'admin';
    }

    const message = await HelpDeskMessage.create({
      ticketId,
      userId,
      contenu,
      typeAuteur,
      dateMessage: new Date()
    });

    res.status(201).json({ 
      message: 'Message ajouté avec succès',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error adding message:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du message', details: error.message });
  }
});

// Get messages for a ticket
router.get('/tickets/:ticketId/messages', async (req, res) => {
  try {
    const messages = await HelpDeskMessage.findAll({
      where: { ticketId: req.params.ticketId },
      order: [['dateMessage', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// ===== FAQ ROUTES =====

// Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const { categorie } = req.query;
    let where = { isPublished: true };

    if (categorie) {
      where.categorie = categorie;
    }

    const faqs = await FAQ.findAll({
      where,
      order: [['ordre', 'ASC'], ['dateCreation', 'DESC']]
    });

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des FAQs' });
  }
});

// Get FAQ by ID
router.get('/faqs/:faqId', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ non trouvée' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la FAQ' });
  }
});

// Mark FAQ as helpful
router.post('/faqs/:faqId/helpful', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ non trouvée' });
    }

    await faq.update({
      utileCount: faq.utileCount + 1
    });

    res.json({ message: 'Merci pour votre retour' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Mark FAQ as not helpful
router.post('/faqs/:faqId/not-helpful', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.faqId);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ non trouvée' });
    }

    await faq.update({
      nonUtileCount: faq.nonUtileCount + 1
    });

    res.json({ message: 'Merci pour votre retour' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// ===== ADMIN DISCUSSION MANAGEMENT ROUTES =====

// Assign ticket to admin
router.patch('/admin/tickets/:ticketId/assign', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent assigner les tickets.' });
    }

    const ticketId = req.params.ticketId;
    const adminId = req.user.id;

    const ticket = await HelpDesk.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    await ticket.update({ assigneeId: adminId });

    res.json({ 
      message: 'Ticket assigné avec succès',
      ticket 
    });
  } catch (error) {
    console.error('❌ Error assigning ticket:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation du ticket', details: error.message });
  }
});

// Get assigned tickets for current admin
router.get('/admin/my-assigned-tickets', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent consulter les tickets assignés.' });
    }

    const adminId = req.user.id;
    const tickets = await HelpDesk.findAll({
      where: { assigneeId: adminId },
      order: [['dateCreation', 'DESC']]
    });

    res.json({ total: tickets.length, tickets });
  } catch (error) {
    console.error('❌ Error fetching assigned tickets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets assignés', details: error.message });
  }
});

// Unassign ticket from admin
router.patch('/admin/tickets/:ticketId/unassign', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé.' });
    }

    const ticketId = req.params.ticketId;
    const ticket = await HelpDesk.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    await ticket.update({ assigneeId: null });

    res.json({ 
      message: 'Ticket désassigné avec succès',
      ticket 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la désassignation du ticket' });
  }
});

// Get discussion messages for a ticket with user info
router.get('/tickets/:ticketId/discussion', async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    const ticket = await HelpDesk.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    const messages = await HelpDeskMessage.findAll({
      where: { ticketId },
      order: [['dateMessage', 'ASC']],
      attributes: ['id', 'userId', 'contenu', 'typeAuteur', 'dateMessage']
    });

    // Structure the discussion with message types (student vs admin)
    const discussion = messages.map(msg => ({
      id: msg.id,
      userId: msg.userId,
      contenu: msg.contenu,
      typeAuteur: msg.typeAuteur,
      dateMessage: msg.dateMessage,
      isAdminMessage: msg.typeAuteur === 'admin' || msg.typeAuteur === 'support'
    }));

    res.json({ 
      ticket,
      messageCount: discussion.length,
      discussion 
    });
  } catch (error) {
    console.error('❌ Error fetching discussion:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la discussion', details: error.message });
  }
});

// ===== CHAT SUPPORT ROUTES =====

// Get all chat support rooms
router.get('/chat-support', async (req, res) => {
  try {
    const { ChatSupport } = require('../models');
    
    const rooms = await ChatSupport.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json(rooms);
  } catch (error) {
    console.error('❌ Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des salons', details: error.message });
  }
});

// Get chat room by ID with messages
router.get('/chat-support/:roomId', async (req, res) => {
  try {
    const { ChatSupport, ChatMessage } = require('../models');
    const User = require('../../auth-service/models/userModel');
    
    const room = await ChatSupport.findByPk(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Salon non trouvé' });
    }

    // Fetch admin information
    let admin = null;
    if (room.adminId) {
      admin = await User.findByPk(room.adminId, {
        attributes: ['id', 'nom', 'prenom', 'email', 'phone']
      });
    }

    const messages = await ChatMessage.findAll({
      where: { chatSupportId: room.id, isDeleted: false },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'content', 'userRole', 'isEdited', 'editedAt', 'createdAt', 'userId']
    });

    res.json({ 
      room,
      admin: admin ? {
        id: admin.id,
        name: `${admin.prenom || ''} ${admin.nom || ''}`.trim() || 'Support Admin',
        email: admin.email,
        phone: admin.phone
      } : null,
      messageCount: messages.length,
      messages 
    });
  } catch (error) {
    console.error('❌ Error fetching chat room:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du salon', details: error.message });
  }
});

// Create a new message in chat support
router.post('/chat-support/:roomId/messages', async (req, res) => {
  try {
    const { ChatMessage } = require('../models');
    const { content } = req.body;
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const userRole = req.user.role || 'etudiant';

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Le contenu du message ne peut pas être vide' });
    }

    const message = await ChatMessage.create({
      content: content.trim(),
      userId,
      userRole,
      chatSupportId: roomId,
      isDeleted: false
    });

    res.status(201).json({
      message: 'Message publié avec succès',
      data: message
    });
  } catch (error) {
    console.error('❌ Error creating message:', error);
    res.status(500).json({ error: 'Erreur lors de la création du message', details: error.message });
  }
});

// Edit a message (only by author or admin)
router.patch('/chat-support/messages/:messageId', async (req, res) => {
  try {
    const { ChatMessage } = require('../models');
    const { content } = req.body;
    const messageId = req.params.messageId;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Le contenu du message ne peut pas être vide' });
    }

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    // Check permissions: only author or admin can edit
    if (message.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Vous ne pouvez pas éditer ce message' });
    }

    await message.update({
      content: content.trim(),
      isEdited: true,
      editedAt: new Date(),
      editedBy: userId
    });

    res.json({ 
      message: 'Message modifié avec succès',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error editing message:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du message', details: error.message });
  }
});

// Delete a message (soft delete - only admin can delete)
router.delete('/chat-support/messages/:messageId', async (req, res) => {
  try {
    const { ChatMessage } = require('../models');
    const messageId = req.params.messageId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { reason } = req.body;

    // Check if user is admin
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Seuls les administrateurs peuvent supprimer les messages' });
    }

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    await message.update({
      isDeleted: true,
      deletedBy: userId,
      deletedAt: new Date(),
      deletionReason: reason || 'No reason provided'
    });

    res.json({ 
      message: 'Message supprimé avec succès',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du message', details: error.message });
  }
});

// Restore a deleted message (admin only)
router.patch('/chat-support/messages/:messageId/restore', async (req, res) => {
  try {
    const { ChatMessage } = require('../models');
    const messageId = req.params.messageId;
    const userRole = req.user.role;

    // Check if user is admin
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Seuls les administrateurs peuvent restaurer les messages' });
    }

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    await message.update({
      isDeleted: false,
      deletedBy: null,
      deletedAt: null,
      deletionReason: null
    });

    res.json({ 
      message: 'Message restauré avec succès',
      data: message 
    });
  } catch (error) {
    console.error('❌ Error restoring message:', error);
    res.status(500).json({ error: 'Erreur lors de la restauration du message', details: error.message });
  }
});

module.exports = router;
