# Secure RESTful API Documentation

## Overview

This is a comprehensive RESTful API implementation with advanced JWT-based security, specifically designed with signed JWT tokens for POST operations to ensure both authentication and data integrity.

## Security Architecture

### 1. Standard JWT Authentication
- All protected endpoints require a valid JWT token
- Token contains user information and expiration
- Transmitted via `Authorization: Bearer <token>` header

### 2. Enhanced POST Security with Signed JWT Tokens
For POST and PUT operations, we implement an additional security layer:

1. **Content Signing Process**: 
   - User first authenticates and gets a standard JWT token
   - User calls `/auth/sign-content` with the data they want to POST
   - Server generates a new JWT token that includes:
     - User authentication information
     - A cryptographically signed version of the content
     - Content integrity signature
   
2. **Content Verification**:
   - When the signed token is used for POST operations
   - Server verifies both user authentication AND content integrity
   - Ensures the submitted data matches exactly what was signed
   - Prevents data tampering and replay attacks

### 3. Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Enabled for cross-origin requests
- **Helmet**: Security headers for protection against common attacks
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive validation for all endpoints

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd skills-copilot-codespaces-vscode

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

```bash
# Optional - defaults provided for development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CONTENT_SECRET=content-signature-secret-key
PORT=3000
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/sign-content
Generate signed JWT token for secure POST operations.

**Headers:**
```
Authorization: Bearer <your-auth-token>
```

**Request Body (the content you want to POST):**
```json
{
  "title": "My New Post",
  "content": "This is the content of my post"
}
```

**Response:**
```json
{
  "message": "Content signed successfully",
  "signedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "signedContent": {
    "title": "My New Post",
    "content": "This is the content of my post"
  },
  "instructions": "Use the signedToken in Authorization header for POST requests"
}
```

### Posts Endpoints

#### GET /api/posts
Retrieve all posts (public endpoint).

**Response:**
```json
{
  "message": "Posts retrieved successfully",
  "count": 2,
  "posts": [
    {
      "id": 1,
      "title": "Welcome Post",
      "content": "Welcome to our API!",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "username": "admin",
        "email": "admin@example.com"
      }
    }
  ]
}
```

#### GET /api/posts/:id
Retrieve a specific post by ID.

**Response:**
```json
{
  "message": "Post retrieved successfully",
  "post": {
    "id": 1,
    "title": "Welcome Post",
    "content": "Welcome to our API!",
    "authorId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

#### POST /api/posts (SECURED)
Create a new post using signed JWT token.

**Headers:**
```
Authorization: Bearer <signed-token-from-sign-content>
```

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my post"
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 3,
    "title": "My New Post",
    "content": "This is the content of my post",
    "authorId": 2,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "author": {
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

#### PUT /api/posts/:id (SECURED)
Update an existing post (requires ownership).

**Headers:**
```
Authorization: Bearer <signed-token-from-sign-content>
```

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "content": "Updated content"
}
```

#### DELETE /api/posts/:id
Delete a post (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <auth-token>
```

**Response:**
```json
{
  "message": "Post deleted successfully",
  "deletedPost": {
    "id": 3,
    "title": "My New Post"
  }
}
```

### User Endpoints

#### GET /api/users
Get all users (requires authentication).

**Headers:**
```
Authorization: Bearer <auth-token>
```

#### GET /api/users/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <auth-token>
```

## Usage Examples

### 1. Complete POST Operation Flow

```bash
# Step 1: Login to get authentication token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# Response will contain a "token" field
# Save this token as AUTH_TOKEN

# Step 2: Sign your content to get a secure token
curl -X POST http://localhost:3000/auth/sign-content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "My Secure Post",
    "content": "This content is cryptographically signed"
  }'

# Response will contain a "signedToken" field
# Save this as SIGNED_TOKEN

# Step 3: Create the post using the signed token
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SIGNED_TOKEN" \
  -d '{
    "title": "My Secure Post",
    "content": "This content is cryptographically signed"
  }'
```

### 2. JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function securePostExample() {
  const baseURL = 'http://localhost:3000';
  
  try {
    // Step 1: Login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'password123'
    });
    
    const authToken = loginResponse.data.token;
    
    // Step 2: Prepare content and get signed token
    const postContent = {
      title: 'My Secure Post',
      content: 'This content is cryptographically signed'
    };
    
    const signResponse = await axios.post(`${baseURL}/auth/sign-content`, postContent, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const signedToken = signResponse.data.signedToken;
    
    // Step 3: Create post with signed token
    const createResponse = await axios.post(`${baseURL}/api/posts`, postContent, {
      headers: { Authorization: `Bearer ${signedToken}` }
    });
    
    console.log('Post created:', createResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

securePostExample();
```

### 3. Python Example

```python
import requests
import json

def secure_post_example():
    base_url = 'http://localhost:3000'
    
    try:
        # Step 1: Login
        login_response = requests.post(f'{base_url}/auth/login', json={
            'username': 'admin',
            'password': 'password123'
        })
        auth_token = login_response.json()['token']
        
        # Step 2: Sign content
        post_content = {
            'title': 'My Secure Post',
            'content': 'This content is cryptographically signed'
        }
        
        sign_response = requests.post(
            f'{base_url}/auth/sign-content',
            json=post_content,
            headers={'Authorization': f'Bearer {auth_token}'}
        )
        signed_token = sign_response.json()['signedToken']
        
        # Step 3: Create post
        create_response = requests.post(
            f'{base_url}/api/posts',
            json=post_content,
            headers={'Authorization': f'Bearer {signed_token}'}
        )
        
        print('Post created:', create_response.json())
        
    except requests.exceptions.RequestException as e:
        print('Error:', e)

secure_post_example()
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": {} // Optional additional details
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (valid token but insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., user already exists)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Security Best Practices

1. **Never expose JWT secrets** in production
2. **Use HTTPS** in production environments
3. **Rotate JWT secrets** regularly
4. **Implement proper logging** for security events
5. **Use environment variables** for sensitive configuration
6. **Regular security audits** of dependencies
7. **Content signing** prevents data tampering
8. **Rate limiting** prevents abuse

## Demo Credentials

For testing purposes, a demo user is pre-created:
- **Username**: `admin`
- **Password**: `password123`

## API Information Endpoint

Visit `GET /api/info` for a complete API overview and endpoint listing.