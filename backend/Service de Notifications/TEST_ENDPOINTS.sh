#!/bin/bash

# Test script for Notification Service endpoints
# Make sure the service is running on port 3005

BASE_URL="http://localhost:3005/api"
USER_ID="1"  # Default test user

echo "🧪 Testing Notification Service Endpoints"
echo "=========================================="
echo ""

# Test 1: Health check
echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/../health" | json_pp
echo ""

# Test 2: Get unread count
echo "2️⃣  Testing GET /notifications/unread/count..."
curl -s -X GET "$BASE_URL/notifications/unread/count?user_id=$USER_ID" \
  -H "Content-Type: application/json" | json_pp
echo ""

# Test 3: Get all notifications
echo "3️⃣  Testing GET /notifications..."
curl -s -X GET "$BASE_URL/notifications?page=1&limit=10&user_id=$USER_ID" \
  -H "Content-Type: application/json" | json_pp
echo ""

# Test 4: Get preferences
echo "4️⃣  Testing GET /preferences..."
curl -s -X GET "$BASE_URL/preferences?user_id=$USER_ID" \
  -H "Content-Type: application/json" | json_pp
echo ""

# Test 5: Update preferences
echo "5️⃣  Testing PUT /preferences (toggle event_created)..."
curl -s -X PUT "$BASE_URL/preferences?user_id=$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"event_created": false}' | json_pp
echo ""

# Test 6: Create test notification
echo "6️⃣  Testing POST /admin/test-notification..."
curl -s -X POST "$BASE_URL/admin/test-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 1,
    "type": "event_created",
    "title": "Test Notification",
    "content": "This is a test notification",
    "priority": "medium"
  }' | json_pp
echo ""

# Test 7: Get notifications again (should have 1+)
echo "7️⃣  Testing GET /notifications again (verify new notification)..."
curl -s -X GET "$BASE_URL/notifications?page=1&limit=10&user_id=$USER_ID" \
  -H "Content-Type: application/json" | json_pp
echo ""

echo "✅ Test suite completed!"
