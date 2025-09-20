/**
 * API Test Script
 * 
 * This script demonstrates the complete flow of the secure RESTful API
 * including authentication, content signing, and secure POST operations.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

const TEST_POST = {
  title: 'Test Post via Signed JWT',
  content: 'This post was created using the secure content signing mechanism.'
};

/**
 * Test the complete API flow
 */
async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: API Info
    console.log('📖 Test 1: Getting API Information');
    const infoResponse = await axios.get(`${BASE_URL}/api/info`);
    console.log('✅ API Info retrieved successfully');
    console.log(`   API Name: ${infoResponse.data.name}`);
    console.log(`   Version: ${infoResponse.data.version}\n`);

    // Test 2: Register new user
    console.log('👤 Test 2: User Registration');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
      console.log('✅ User registered successfully');
      console.log(`   User ID: ${registerResponse.data.user.id}`);
      console.log(`   Username: ${registerResponse.data.user.username}\n`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  User already exists, continuing with login...\n');
      } else {
        throw error;
      }
    }

    // Test 3: Login
    console.log('🔐 Test 3: User Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Token received (first 50 chars): ${authToken.substring(0, 50)}...\n`);

    // Test 4: Get all posts (public endpoint)
    console.log('📝 Test 4: Getting All Posts (Public)');
    const postsResponse = await axios.get(`${BASE_URL}/api/posts`);
    console.log('✅ Posts retrieved successfully');
    console.log(`   Total posts: ${postsResponse.data.count}\n`);

    // Test 5: Get user profile
    console.log('👥 Test 5: Getting User Profile');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User profile retrieved');
    console.log(`   Username: ${profileResponse.data.user.username}`);
    console.log(`   Email: ${profileResponse.data.user.email}\n`);

    // Test 6: Try POST without signed token (should fail)
    console.log('❌ Test 6: POST without Signed Token (Expected to Fail)');
    try {
      await axios.post(`${BASE_URL}/api/posts`, TEST_POST, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ ERROR: POST should have failed without signed token');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ POST correctly rejected without content signature');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    // Test 7: Sign content for secure POST
    console.log('🔏 Test 7: Content Signing for Secure POST');
    const signResponse = await axios.post(`${BASE_URL}/auth/sign-content`, TEST_POST, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const signedToken = signResponse.data.signedToken;
    console.log('✅ Content signed successfully');
    console.log(`   Signed token received (first 50 chars): ${signedToken.substring(0, 50)}...\n`);

    // Test 8: Create post with signed token
    console.log('📤 Test 8: Creating Post with Signed Token');
    const createPostResponse = await axios.post(`${BASE_URL}/api/posts`, TEST_POST, {
      headers: { Authorization: `Bearer ${signedToken}` }
    });
    const newPostId = createPostResponse.data.post.id;
    console.log('✅ Post created successfully');
    console.log(`   Post ID: ${newPostId}`);
    console.log(`   Title: ${createPostResponse.data.post.title}\n`);

    // Test 9: Try to POST different content with same signed token (should fail)
    console.log('❌ Test 9: POST Different Content with Same Token (Expected to Fail)');
    const differentContent = {
      title: 'Different Title',
      content: 'This is different content that was not signed'
    };
    
    try {
      await axios.post(`${BASE_URL}/api/posts`, differentContent, {
        headers: { Authorization: `Bearer ${signedToken}` }
      });
      console.log('❌ ERROR: POST should have failed with different content');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ POST correctly rejected due to content signature mismatch');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    // Test 10: Update post with signed token
    console.log('📝 Test 10: Updating Post with Signed Token');
    const updateContent = {
      title: 'Updated Test Post',
      content: 'This post has been updated using the secure signing mechanism.'
    };
    
    // Sign the update content
    const updateSignResponse = await axios.post(`${BASE_URL}/auth/sign-content`, updateContent, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const updateSignedToken = updateSignResponse.data.signedToken;
    
    // Update the post
    const updateResponse = await axios.put(`${BASE_URL}/api/posts/${newPostId}`, updateContent, {
      headers: { Authorization: `Bearer ${updateSignedToken}` }
    });
    console.log('✅ Post updated successfully');
    console.log(`   New title: ${updateResponse.data.post.title}\n`);

    // Test 11: Get the updated post
    console.log('📖 Test 11: Retrieving Updated Post');
    const updatedPostResponse = await axios.get(`${BASE_URL}/api/posts/${newPostId}`);
    console.log('✅ Updated post retrieved');
    console.log(`   Title: ${updatedPostResponse.data.post.title}`);
    console.log(`   Content: ${updatedPostResponse.data.post.content}\n`);

    // Test 12: Delete post
    console.log('🗑️  Test 12: Deleting Post');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/posts/${newPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post deleted successfully');
    console.log(`   Deleted post: ${deleteResponse.data.deletedPost.title}\n`);

    // Test 13: Verify post is deleted
    console.log('🔍 Test 13: Verifying Post Deletion');
    try {
      await axios.get(`${BASE_URL}/api/posts/${newPostId}`);
      console.log('❌ ERROR: Post should have been deleted');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Post correctly deleted (404 Not Found)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ API Info retrieval');
    console.log('   ✅ User registration');
    console.log('   ✅ User authentication');
    console.log('   ✅ Public endpoint access');
    console.log('   ✅ Authenticated endpoint access');
    console.log('   ✅ Security validation (POST without signature rejected)');
    console.log('   ✅ Content signing mechanism');
    console.log('   ✅ Secure POST operation');
    console.log('   ✅ Content integrity validation (different content rejected)');
    console.log('   ✅ Secure UPDATE operation');
    console.log('   ✅ GET specific resource');
    console.log('   ✅ DELETE operation');
    console.log('   ✅ Resource deletion verification');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/`);
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   npm run dev');
    process.exit(1);
  }
}

// Run tests
async function main() {
  await checkServer();
  await runTests();
}

main();