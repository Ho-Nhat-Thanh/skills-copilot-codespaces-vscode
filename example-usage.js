/**
 * Example Usage: Secure POST Operation with JWT Content Signing
 * 
 * This example demonstrates the complete security flow for POST operations:
 * 1. User authentication
 * 2. Content signing 
 * 3. Secure POST with signed JWT token
 * 
 * Run this example with: node example-usage.js
 * (Make sure the server is running first: npm start)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function demonstrateSecureAPI() {
  console.log('🔐 Secure RESTful API - Example Usage\n');

  try {
    // ============================
    // STEP 1: USER AUTHENTICATION
    // ============================
    console.log('Step 1: User Authentication');
    console.log('-----------------------------');
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',  // Demo user
      password: 'password123'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`User: ${loginResponse.data.user.username}`);
    console.log(`Token: ${authToken.substring(0, 50)}...\n`);

    // ========================================
    // STEP 2: ATTEMPT POST WITHOUT SIGNATURE
    // ========================================
    console.log('Step 2: Attempt POST without Content Signature (will fail)');
    console.log('------------------------------------------------------------');
    
    const postData = {
      title: 'My Secure Post',
      content: 'This post demonstrates the secure signing mechanism.'
    };

    try {
      await axios.post(`${BASE_URL}/api/posts`, postData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ ERROR: This should have failed!');
    } catch (error) {
      console.log('✅ POST correctly rejected without content signature');
      console.log(`Error: ${error.response.data.error}`);
      console.log(`Message: ${error.response.data.message}\n`);
    }

    // ===========================
    // STEP 3: CONTENT SIGNING
    // ===========================
    console.log('Step 3: Content Signing');
    console.log('------------------------');
    
    console.log('Signing content:', JSON.stringify(postData, null, 2));
    
    const signResponse = await axios.post(`${BASE_URL}/auth/sign-content`, postData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const signedToken = signResponse.data.signedToken;
    console.log('✅ Content signed successfully');
    console.log(`Signed Token: ${signedToken.substring(0, 50)}...\n`);

    // ================================
    // STEP 4: SECURE POST OPERATION
    // ================================
    console.log('Step 4: Secure POST with Signed Token');
    console.log('--------------------------------------');
    
    const createResponse = await axios.post(`${BASE_URL}/api/posts`, postData, {
      headers: { Authorization: `Bearer ${signedToken}` }
    });
    
    console.log('✅ Post created successfully with signed token');
    console.log(`Post ID: ${createResponse.data.post.id}`);
    console.log(`Title: ${createResponse.data.post.title}`);
    console.log(`Author: ${createResponse.data.post.author.username}\n`);

    // ========================================
    // STEP 5: ATTEMPT TO TAMPER WITH DATA
    // ========================================
    console.log('Step 5: Attempt Data Tampering (will fail)');
    console.log('--------------------------------------------');
    
    const tamperedData = {
      title: 'HACKED TITLE',  // Different from signed content
      content: 'This is malicious content!'
    };

    try {
      await axios.post(`${BASE_URL}/api/posts`, tamperedData, {
        headers: { Authorization: `Bearer ${signedToken}` }
      });
      console.log('❌ ERROR: Tampered data should have been rejected!');
    } catch (error) {
      console.log('✅ Data tampering correctly detected and rejected');
      console.log(`Error: ${error.response.data.error}`);
      console.log('The server detected that submitted content does not match signed content.\n');
    }

    // ============================
    // STEP 6: VERIFY POST EXISTS
    // ============================
    console.log('Step 6: Verify Created Post');
    console.log('----------------------------');
    
    const getResponse = await axios.get(`${BASE_URL}/api/posts/${createResponse.data.post.id}`);
    console.log('✅ Post retrieved successfully');
    console.log(`Title: ${getResponse.data.post.title}`);
    console.log(`Content: ${getResponse.data.post.content}`);
    console.log(`Created: ${new Date(getResponse.data.post.createdAt).toLocaleString()}\n`);

    // ===============================
    // STEP 7: CLEAN UP (DELETE POST)
    // ===============================
    console.log('Step 7: Clean Up - Delete Test Post');
    console.log('------------------------------------');
    
    await axios.delete(`${BASE_URL}/api/posts/${createResponse.data.post.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Test post deleted successfully\n');

    // ===================
    // SUMMARY
    // ===================
    console.log('🎉 Example Complete!');
    console.log('====================');
    console.log('✅ User authentication successful');
    console.log('✅ Content signature requirement enforced');
    console.log('✅ Content signing mechanism working');
    console.log('✅ Secure POST operation successful');
    console.log('✅ Data tampering prevention active');
    console.log('✅ Content integrity verification working');
    console.log('\n🔒 Security Features Demonstrated:');
    console.log('   • JWT-based authentication');
    console.log('   • Content signature verification');
    console.log('   • Data tampering prevention');
    console.log('   • Secure POST operations');

  } catch (error) {
    console.error('❌ Example failed:', error.response?.data || error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`);
    console.log('🟢 Server is running at', BASE_URL);
    console.log('📚 API Documentation:', `${BASE_URL}/api/info\n`);
  } catch (error) {
    console.error('❌ Server is not running. Please start it first:');
    console.error('   npm start');
    console.error('   or');
    console.error('   npm run dev\n');
    process.exit(1);
  }
}

// Run the example
async function main() {
  await checkServer();
  await demonstrateSecureAPI();
}

main();