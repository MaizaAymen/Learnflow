/**
 * NOTIFICATION SERVICE - TESTING EXAMPLES
 * 
 * These examples demonstrate how to test the notification service
 * Run these commands in your terminal to test different notification types
 */

// ============================================================================
// 1. TEST NOTIFICATION CREATION
// ============================================================================

// Create a test notification
curl -X POST http://localhost:3005/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 1,
    "type": "event_created",
    "title": "📅 Nouvel Événement",
    "content": "Un nouvel événement \"Réunion de classe\" a été créé",
    "metadata": {
      "event_id": "evt-123",
      "class_id": "cls-456"
    },
    "priority": "high",
    "action_url": "/events/evt-123"
  }'

// ============================================================================
// 2. TEST EVENT WEBHOOKS
// ============================================================================

// Event Created - Notify students
curl -X POST http://localhost:3005/api/webhooks/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event.created",
    "data": {
      "event_id": "evt-001",
      "title": "Réunion de classe",
      "class_id": "cls-001",
      "student_ids": [1, 2, 3, 4],
      "event_creator_id": 10
    }
  }'

// Event Registered - Notify creator
curl -X POST http://localhost:3005/api/webhooks/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event.registered",
    "data": {
      "event_id": "evt-001",
      "student_id": 1,
      "event_creator_id": 10,
      "event_title": "Réunion de classe"
    }
  }'

// ============================================================================
// 3. TEST REFERENCE SERVICE WEBHOOKS
// ============================================================================

// Absence Registered
curl -X POST http://localhost:3005/api/webhooks/reference \
  -H "Content-Type: application/json" \
  -d '{
    "type": "absence.registered",
    "data": {
      "absence_id": "abs-001",
      "student_id": 1,
      "course_name": "Mathématiques",
      "date": "2024-01-15"
    }
  }'

// Elimination Risk Alert
curl -X POST http://localhost:3005/api/webhooks/reference \
  -H "Content-Type: application/json" \
  -d '{
    "type": "student.elimination_risk",
    "data": {
      "student_id": 2,
      "risk_level": "high",
      "absence_count": 12,
      "reason": "12 absences sans justification",
      "department_head_id": 50
    }
  }'

// Schedule Changed
curl -X POST http://localhost:3005/api/webhooks/reference \
  -H "Content-Type: application/json" \
  -d '{
    "type": "schedule.changed",
    "data": {
      "schedule_id": "sch-001",
      "class_id": "cls-001",
      "student_ids": [1, 2, 3, 4],
      "old_time": "10:00-12:00",
      "new_time": "14:00-16:00",
      "course_name": "Mathématiques"
    }
  }'

// ============================================================================
// 4. TEST MESSAGING SERVICE WEBHOOKS
// ============================================================================

// Message Received
curl -X POST http://localhost:3005/api/webhooks/messaging \
  -H "Content-Type: application/json" \
  -d '{
    "type": "message.received",
    "data": {
      "message_id": "msg-001",
      "recipient_id": 1,
      "sender_name": "Jean Dupont",
      "message_preview": "Bonjour, comment ça va? Je voulais te parler du projet..."
    }
  }'

// ============================================================================
// 5. TEST AUTH SERVICE WEBHOOKS
// ============================================================================

// Account Created
curl -X POST http://localhost:3005/api/webhooks/auth \
  -H "Content-Type: application/json" \
  -d '{
    "type": "account.created",
    "data": {
      "user_id": 100,
      "temp_password": "TempPwd12345!",
      "email": "student@learnflow.com",
      "user_name": "Ahmed Mohamed"
    }
  }'

// ============================================================================
// 6. TEST CONTENT SERVICE WEBHOOKS
// ============================================================================

// Document Published
curl -X POST http://localhost:3005/api/webhooks/content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "document.published",
    "data": {
      "document_id": "doc-001",
      "document_title": "Cours de Mathématiques Avancées",
      "department_id": "dept-001",
      "user_ids": [1, 2, 3, 4, 5],
      "document_type": "PDF"
    }
  }'

// Announcement Published
curl -X POST http://localhost:3005/api/webhooks/content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "announcement.published",
    "data": {
      "announcement_id": "ann-001",
      "title": "Les examens commencent le 20 février",
      "scope": "department",
      "user_ids": [1, 2, 3, 4, 5, 6, 7]
    }
  }'

// ============================================================================
// 7. TEST NOTIFICATION RETRIEVAL
// ============================================================================

// Get all notifications (with pagination)
curl "http://localhost:3005/api/notifications?page=1&limit=10"

// Get unread notifications only
curl "http://localhost:3005/api/notifications?unread_only=true"

// Get unread count
curl http://localhost:3005/api/notifications/unread/count

// Get specific notification
curl http://localhost:3005/api/notifications/[notification-id]

// ============================================================================
// 8. TEST NOTIFICATION ACTIONS
// ============================================================================

// Mark notification as read
curl -X PUT http://localhost:3005/api/notifications/[notification-id]/read

// Mark all as read
curl -X PUT http://localhost:3005/api/notifications/read/all

// Delete notification
curl -X DELETE http://localhost:3005/api/notifications/[notification-id]

// Delete batch of notifications
curl -X DELETE http://localhost:3005/api/notifications/delete/batch \
  -H "Content-Type: application/json" \
  -d '{
    "notification_ids": ["id1", "id2", "id3"]
  }'

// ============================================================================
// 9. TEST PREFERENCES
// ============================================================================

// Get user preferences
curl http://localhost:3005/api/preferences

// Update all preferences
curl -X PUT http://localhost:3005/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "event_created": false,
    "absence_registered": true,
    "elimination_risk": true,
    "email_enabled": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "08:00"
  }'

// Toggle specific notification type
curl -X PUT http://localhost:3005/api/preferences/notification-type/event_created \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'

// Set quiet hours (no notifications between 22:00 and 08:00)
curl -X PUT http://localhost:3005/api/preferences/quiet-hours \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "22:00:00",
    "end_time": "08:00:00"
  }'

// ============================================================================
// 10. BULK TESTING - CREATE MULTIPLE NOTIFICATIONS
// ============================================================================

// Script to create notifications for multiple students
bash -c '
for i in {1..10}; do
  curl -X POST http://localhost:3005/api/admin/test-notification \
    -H "Content-Type: application/json" \
    -d "{
      \"recipient_id\": $i,
      \"type\": \"event_created\",
      \"title\": \"📅 Nouvel Événement\",
      \"content\": \"Un nouvel événement a été créé pour votre classe\",
      \"priority\": \"high\"
    }"
  echo "Created notification for user $i"
  sleep 1
done
'

// ============================================================================
// 11. PERFORMANCE TEST
// ============================================================================

// Simulate high volume of notifications
bash -c '
for i in {1..100}; do
  curl -X POST http://localhost:3005/api/admin/test-notification \
    -H "Content-Type: application/json" \
    -d "{
      \"recipient_id\": $((RANDOM % 10 + 1)),
      \"type\": \"message_received\",
      \"title\": \"📥 Nouveau Message\",
      \"content\": \"Message #$i from different users\",
      \"priority\": \"medium\"
    }" &
done
wait
echo "Completed 100 concurrent requests"
'

// ============================================================================
// 12. DATABASE VERIFICATION
// ============================================================================

// Connect to PostgreSQL and verify notifications
psql -U postgres -d auth_service -c "
  SELECT 
    id,
    recipient_id,
    type,
    title,
    is_read,
    created_at
  FROM referentiels.notifications
  ORDER BY created_at DESC
  LIMIT 10;
"

// Check unread count by type
psql -U postgres -d auth_service -c "
  SELECT 
    type,
    COUNT(*) as total,
    SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread
  FROM referentiels.notifications
  GROUP BY type;
"

// Check notification logs
psql -U postgres -d auth_service -c "
  SELECT 
    id,
    event_type,
    trigger_source,
    delivery_status,
    created_at
  FROM referentiels.notification_logs
  ORDER BY created_at DESC
  LIMIT 10;
"

// ============================================================================
// 13. ERROR TESTING
// ============================================================================

// Test with invalid recipient ID (should still create but might fail)
curl -X POST http://localhost:3005/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 999999,
    "type": "event_created",
    "title": "Test",
    "content": "Test notification"
  }'

// Test with missing required fields
curl -X POST http://localhost:3005/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 1
  }'

// Test invalid notification type
curl -X POST http://localhost:3005/api/webhooks/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "data": {}
  }'

// ============================================================================
// NOTES
// ============================================================================
/*
- Replace [notification-id] with actual UUID from database
- Replace [user-id] with actual user ID
- Default admin endpoint for testing - should be protected in production
- Most endpoints require authentication in production
- Health check: curl http://localhost:3005/health
*/
