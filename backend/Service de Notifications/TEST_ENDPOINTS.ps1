# Test script for Notification Service endpoints
# Make sure the service is running on port 3005

$BASE_URL = "http://localhost:3005/api"
$USER_ID = "1"  # Default test user

Write-Host "🧪 Testing Notification Service Endpoints" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/../health" -Method Get | ConvertTo-Json | Write-Host
Write-Host ""

# Test 2: Get unread count
Write-Host "2️⃣  Testing GET /notifications/unread/count..." -ForegroundColor Yellow
try {
  $response = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread/count?user_id=$USER_ID" `
    -Method Get `
    -Headers @{"Content-Type" = "application/json"}
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Get all notifications
Write-Host "3️⃣  Testing GET /notifications..." -ForegroundColor Yellow
try {
  $response = Invoke-RestMethod -Uri "$BASE_URL/notifications?page=1&limit=10&user_id=$USER_ID" `
    -Method Get `
    -Headers @{"Content-Type" = "application/json"}
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get preferences
Write-Host "4️⃣  Testing GET /preferences..." -ForegroundColor Yellow
try {
  $response = Invoke-RestMethod -Uri "$BASE_URL/preferences?user_id=$USER_ID" `
    -Method Get `
    -Headers @{"Content-Type" = "application/json"}
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Update preferences
Write-Host "5️⃣  Testing PUT /preferences (toggle event_created)..." -ForegroundColor Yellow
try {
  $body = @{"event_created" = $false} | ConvertTo-Json
  $response = Invoke-RestMethod -Uri "$BASE_URL/preferences?user_id=$USER_ID" `
    -Method Put `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Create test notification
Write-Host "6️⃣  Testing POST /admin/test-notification..." -ForegroundColor Yellow
try {
  $body = @{
    recipient_id = 1
    type = "event_created"
    title = "Test Notification"
    content = "This is a test notification"
    priority = "medium"
  } | ConvertTo-Json
  
  $response = Invoke-RestMethod -Uri "$BASE_URL/admin/test-notification" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get notifications again
Write-Host "7️⃣  Testing GET /notifications again (verify new notification)..." -ForegroundColor Yellow
try {
  $response = Invoke-RestMethod -Uri "$BASE_URL/notifications?page=1&limit=10&user_id=$USER_ID" `
    -Method Get `
    -Headers @{"Content-Type" = "application/json"}
  $response | ConvertTo-Json | Write-Host
} catch {
  Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Test suite completed!" -ForegroundColor Green
