#!/usr/bin/env node

// Test script for project registration API
const http = require('http');

// Sample project data
const projectData = {
  "title": "Web Development Project",
  "description": "Building a responsive web application",
  "courseId": 4,
  "projectType": "project",
  "topic": "Full Stack Development",
  "objectives": ["Learn Node.js", "Learn React"],
  "studentId": 1,
  "studentGroup": "Group A"
};

console.log('🧪 Testing Project Registration API');
console.log('=====================================\n');
console.log('Request Data:');
console.log(JSON.stringify(projectData, null, 2));
console.log('\n');

// Make the request
const postData = JSON.stringify(projectData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/projects',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OTAxMiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJzdHVkZW50In0.test'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);
    console.log('\nResponse:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('\n=====================================');
    if (res.statusCode === 201 || res.statusCode === 200) {
      console.log('✅ TEST PASSED - Project created successfully!');
    } else if (res.statusCode === 401) {
      console.log('⚠️  Got 401 Unauthorized - This is expected without a real token');
      console.log('The important thing is that we got a response, not a 500 error!');
    } else if (res.statusCode === 500) {
      console.log('❌ TEST FAILED - Got 500 error');
    } else {
      console.log(`⚠️  Got ${res.statusCode} response`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  console.error('Make sure the server is running on port 3000');
});

req.write(postData);
req.end();
