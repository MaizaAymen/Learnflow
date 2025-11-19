# 📡 Messagerie Service - API Routes Reference

## 🔗 Base URL
```
http://localhost:3001/api/messaging
```

## 🔐 Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 API Endpoints

### 1️⃣ Create Conversation
**POST** `/conversations`

**Description:** Create a new direct or group conversation

**Request Body:**
```json
{
  "type": "direct",                    // "direct" or "group"
  "participant_ids": [2, 3],          // User IDs to add
  "group_name": "Project Team"        // Required if type="group"
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "direct",
  "group_name": null,
  "created_at": "2024-11-18T10:30:00.000Z"
}
```

**Errors:**
- `400` - Invalid participant_ids or direct conversation must have exactly 1 other participant
- `401` - Token not provided
- `403` - Invalid token
- `500` - Server error

---

### 2️⃣ Get Conversations
**GET** `/conversations?page=1&limit=20`

**Description:** List all conversations for current user

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "direct",
      "group_name": null,
      "last_message_at": "2024-11-18T10:45:00.000Z",
      "created_at": "2024-11-18T10:30:00.000Z",
      "last_message": "Hi there! How are you?",
      "unread_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### 3️⃣ Get Messages
**GET** `/conversations/:conversationId/messages?page=1&limit=30`

**Description:** Get messages for a specific conversation (auto-marks as read)

**URL Parameters:**
- `conversationId` - UUID of conversation

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 30) - Messages per page

**Response (200):**
```json
{
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender_id": 2,
      "content": "Hello!",
      "is_read": true,
      "read_at": "2024-11-18T10:50:00.000Z",
      "created_at": "2024-11-18T10:45:00.000Z",
      "updated_at": "2024-11-18T10:50:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 45,
    "pages": 2
  }
}
```

**Errors:**
- `403` - User is not participant of this conversation
- `404` - Conversation not found

---

### 4️⃣ Send Message
**POST** `/messages`

**Description:** Send a new message to a conversation

**Request Body:**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "This is my message"
}
```

**Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "sender_id": 1,
  "content": "This is my message",
  "is_read": false,
  "created_at": "2024-11-18T10:55:00.000Z"
}
```

**Errors:**
- `400` - conversation_id and content are required
- `403` - User is not participant of this conversation

---

### 5️⃣ Search Users
**GET** `/search-users?query=john&limit=10`

**Description:** Search for users to start a conversation

**Query Parameters:**
- `query` (required) - Search string (min 2 chars)
- `limit` (default: 10) - Max results

**Response (200):**
```json
[
  {
    "id": 2,
    "nom": "Doe",
    "prenom": "John",
    "email": "john.doe@example.com",
    "role": "etudiant"
  },
  {
    "id": 3,
    "nom": "Smith",
    "prenom": "Jane",
    "email": "jane.smith@example.com",
    "role": "enseignant"
  }
]
```

**Errors:**
- `400` - Query must be at least 2 characters

---

### 6️⃣ Get Unread Count
**GET** `/unread-count`

**Description:** Get total count of unread messages

**Response (200):**
```json
{
  "unread_count": 5
}
```

---

### 7️⃣ Get Online Status
**GET** `/online-status/:userId`

**Description:** Check if a user is online

**URL Parameters:**
- `userId` - User ID

**Response (200):**
```json
{
  "is_online": true,
  "last_seen": "2024-11-18T10:55:00.000Z"
}
```

**Note:** If user has no online status record, returns `is_online: false`

---

### 8️⃣ Leave Conversation
**DELETE** `/conversations/:conversationId`

**Description:** Leave/delete a conversation (soft delete)

**URL Parameters:**
- `conversationId` - UUID of conversation

**Response (200):**
```json
{
  "message": "Conversation deleted"
}
```

---

## 🧪 Testing with cURL

### 1. Create Conversation
```bash
curl -X POST http://localhost:3001/api/messaging/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "direct",
    "participant_ids": [2]
  }'
```

### 2. List Conversations
```bash
curl -X GET "http://localhost:3001/api/messaging/conversations?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Send Message
```bash
curl -X POST http://localhost:3001/api/messaging/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello!"
  }'
```

### 4. Get Messages
```bash
curl -X GET "http://localhost:3001/api/messaging/conversations/550e8400-e29b-41d4-a716-446655440000/messages?page=1&limit=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Search Users
```bash
curl -X GET "http://localhost:3001/api/messaging/search-users?query=john&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get Unread Count
```bash
curl -X GET http://localhost:3001/api/messaging/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Check Online Status
```bash
curl -X GET http://localhost:3001/api/messaging/online-status/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 8. Leave Conversation
```bash
curl -X DELETE http://localhost:3001/api/messaging/conversations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚡ WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Emit Events
```javascript
// Send message
socket.emit('send_message', {
  conversation_id: 'uuid',
  content: 'Hello!'
});

// User is typing
socket.emit('typing', {
  conversation_id: 'uuid'
});

// Stop typing
socket.emit('stop_typing', {
  conversation_id: 'uuid'
});

// Join conversation
socket.emit('join_conversation', {
  conversation_id: 'uuid'
});

// Leave conversation
socket.emit('leave_conversation', {
  conversation_id: 'uuid'
});
```

### Listen Events
```javascript
// Receive new message
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// User online
socket.on('user_online', (data) => {
  console.log('User online:', data.user_id);
});

// User offline
socket.on('user_offline', (data) => {
  console.log('User offline:', data.user_id);
});

// User typing
socket.on('user_typing', (data) => {
  console.log('User typing:', data.user_id);
});

// User stop typing
socket.on('user_stop_typing', (data) => {
  console.log('User stop typing:', data.user_id);
});

// Notification
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

---

## 🔄 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (missing token) |
| 403 | Forbidden (invalid token or no permission) |
| 404 | Not Found |
| 500 | Server Error |

---

## 📝 Error Responses

All errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## 🚀 Quick Start

1. **Start Service**
   ```bash
   cd backend/Messagerie
   npm start
   ```

2. **Get JWT Token**
   - Login via frontend or auth service
   - Token stored in localStorage

3. **Make API Calls**
   - Include `Authorization: Bearer token` in headers
   - Use base URL: `http://localhost:3001/api/messaging`

4. **Real-time Updates**
   - Connect via WebSocket with token in auth
   - Listen for socket events

---

**Status**: ✅ All 7 REST endpoints + WebSocket ready  
**Last Updated**: November 18, 2024
