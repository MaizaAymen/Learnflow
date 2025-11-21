const express = require('express');
const { uuidv4 } = require('../utils/uuidGenerator');

module.exports = (db, authenticate, logAudit) => {
  const router = express.Router();
  
  // Get models from the passed object
  const { Comment } = db.models || {};
  
  if (!Comment) {
    console.error('❌ Comment model not found');
  }

  // ✅ Add comment
  router.post('/', authenticate, async (req, res) => {
    try {
      const { content, targetType, targetId, parentCommentId } = req.body;

      if (!content || !targetType || !targetId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const comment = await Comment.create({
        id: uuidv4(),
        content,
        authorId: req.user.id,
        authorName: req.user.name,
        targetType,
        targetId,
        parentCommentId: parentCommentId || null,
        replies: [],
        likes: [],
        createdAt: new Date(),
      });

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'comment',
        entityId: comment.id,
        description: `Added comment on ${targetType}`,
        newValues: comment.toJSON(),
      });

      res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Get comments for target
  router.get('/:targetType/:targetId', authenticate, async (req, res) => {
    try {
      const { targetType, targetId } = req.params;

      const comments = await Comment.findAll({
        where: {
          targetType,
          targetId,
          parentCommentId: null,
          isDeleted: false,
        },
        order: [['createdAt', 'DESC']],
      });

      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Add reply to comment
  router.post('/:commentId/reply', authenticate, async (req, res) => {
    try {
      const { content } = req.body;
      const parentComment = await Comment.findByPk(req.params.commentId);

      if (!parentComment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const reply = await Comment.create({
        id: uuidv4(),
        content,
        authorId: req.user.id,
        authorName: req.user.name,
        targetType: parentComment.targetType,
        targetId: parentComment.targetId,
        parentCommentId: req.params.commentId,
        replies: [],
        likes: [],
        createdAt: new Date(),
      });

      // Add reply to parent comment's replies array
      if (!parentComment.replies) parentComment.replies = [];
      parentComment.replies.push(reply.toJSON());
      await parentComment.save();

      await logAudit({
        userId: req.user.id,
        action: 'CREATE',
        entityType: 'comment_reply',
        entityId: reply.id,
        description: 'Added reply to comment',
      });

      res.status(201).json({ message: 'Reply added successfully', reply });
    } catch (error) {
      console.error('Error adding reply:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Toggle like on comment
  router.post('/:commentId/like', authenticate, async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (!comment.likes) comment.likes = [];

      const userLikeIndex = comment.likes.indexOf(req.user.id);

      if (userLikeIndex > -1) {
        comment.likes.splice(userLikeIndex, 1);
      } else {
        comment.likes.push(req.user.id);
      }

      comment.likeCount = comment.likes.length;
      await comment.save();

      res.json({ message: 'Like toggled successfully', comment });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Edit comment
  router.put('/:commentId', authenticate, async (req, res) => {
    try {
      const { content } = req.body;
      const comment = await Comment.findByPk(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      comment.content = content;
      comment.isEdited = true;
      comment.updatedAt = new Date();
      await comment.save();

      await logAudit({
        userId: req.user.id,
        action: 'UPDATE',
        entityType: 'comment',
        entityId: comment.id,
        description: 'Updated comment',
      });

      res.json({ message: 'Comment updated successfully', comment });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // ✅ Delete comment (soft delete)
  router.delete('/:commentId', authenticate, async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      comment.isDeleted = true;
      comment.deletedAt = new Date();
      await comment.save();

      await logAudit({
        userId: req.user.id,
        action: 'DELETE',
        entityType: 'comment',
        entityId: comment.id,
        description: 'Deleted comment',
      });

      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};
