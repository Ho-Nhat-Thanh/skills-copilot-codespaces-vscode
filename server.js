/**
 * Full RESTful API with JWT-based Security
 * 
 * This server implements a complete RESTful API with the following features:
 * - Standard REST endpoints (GET, POST, PUT, DELETE)
 * - JWT-based authentication system
 * - Signed JWT tokens for POST endpoint security
 * - Rate limiting and security headers
 * - Comprehensive error handling
 * 
 * Security Architecture:
 * - POST endpoints require signed JWT tokens
 * - JWT tokens contain both user authentication data and content signature
 * - Double verification: user authentication + content integrity
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const CONTENT_SIGNATURE_SECRET = process.env.CONTENT_SECRET || 'content-signature-secret-key';

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// In-memory storage for demo purposes (use database in production)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    // Password: 'password123' (hashed)
    password: '$2b$10$0uAwxliS4dwaXdHPFQEL0.zapr/Vwzhe/loa7QMO/1NJ40aeWKQJ6'
  }
];

let posts = [
  { id: 1, title: 'Welcome Post', content: 'Welcome to our API!', authorId: 1, createdAt: new Date() },
  { id: 2, title: 'Security First', content: 'All POST operations are secured with JWT tokens.', authorId: 1, createdAt: new Date() }
];

let nextUserId = 2;
let nextPostId = 3;

/**
 * JWT Token Generation Utility
 * 
 * Creates a JWT token with user information and content signature.
 * For POST operations, the content is signed to ensure data integrity.
 * 
 * @param {Object} user - User object containing id, username, email
 * @param {Object} content - Optional content to be signed (for POST operations)
 * @returns {string} - Signed JWT token
 */
function generateToken(user, content = null) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };

  // If content is provided (for POST operations), add content signature
  if (content) {
    const contentString = JSON.stringify(content);
    const contentSignature = jwt.sign({ content: contentString }, CONTENT_SIGNATURE_SECRET);
    payload.contentSignature = contentSignature;
    payload.signedContent = contentString;
  }

  return jwt.sign(payload, JWT_SECRET);
}

/**
 * JWT Token Verification Middleware
 * 
 * Verifies the JWT token from the Authorization header.
 * Extracts user information and validates token integrity.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access denied. No token provided.',
      message: 'Authorization header must contain a Bearer token'
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid token.',
      message: error.message
    });
  }
}

/**
 * Content Signature Verification Middleware (for POST operations)
 * 
 * This middleware provides additional security for POST endpoints by:
 * 1. Verifying that the JWT token contains a content signature
 * 2. Validating that the submitted content matches the signed content
 * 3. Ensuring data integrity and preventing tampering
 * 
 * Security Flow:
 * - Client first authenticates and gets a token
 * - Client signs their POST data with the token
 * - Server verifies both authentication and content integrity
 */
function verifyContentSignature(req, res, next) {
  // Check if token contains content signature (required for POST operations)
  if (!req.user.contentSignature || !req.user.signedContent) {
    return res.status(400).json({
      error: 'Content signature required for POST operations.',
      message: 'JWT token must contain signed content for data integrity verification.',
      howToFix: 'Use the /auth/sign-content endpoint to get a token with content signature'
    });
  }

  try {
    // Verify the content signature
    const contentPayload = jwt.verify(req.user.contentSignature, CONTENT_SIGNATURE_SECRET);
    const signedContent = JSON.parse(contentPayload.content);
    
    // Compare submitted content with signed content
    const submittedContent = JSON.stringify(req.body);
    const originalContent = JSON.stringify(signedContent);

    if (submittedContent !== originalContent) {
      return res.status(400).json({
        error: 'Content signature mismatch.',
        message: 'Submitted content does not match signed content.',
        details: {
          submittedContent: req.body,
          signedContent: signedContent
        }
      });
    }

    // Content is verified, proceed
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid content signature.',
      message: error.message
    });
  }
}

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

/**
 * POST /auth/register
 * Register a new user account
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['username', 'email', 'password']
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Username or email is already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: nextUserId++,
      username,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    // Generate token (without content signature for registration)
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        required: ['username', 'password']
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    // Generate token (without content signature for login)
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * POST /auth/sign-content
 * Generate a JWT token with content signature for secure POST operations
 * 
 * This endpoint is crucial for the security model:
 * 1. Client authenticates with their token
 * 2. Client provides the content they want to POST
 * 3. Server generates a new token with content signature
 * 4. Client uses this new token for the actual POST request
 */
app.post('/auth/sign-content', verifyToken, (req, res) => {
  try {
    const content = req.body;

    if (!content || Object.keys(content).length === 0) {
      return res.status(400).json({
        error: 'No content provided',
        message: 'Content to be signed must be provided in request body'
      });
    }

    // Find the user for token generation
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User associated with token no longer exists'
      });
    }

    // Generate new token with content signature
    const signedToken = generateToken(user, content);

    res.json({
      message: 'Content signed successfully',
      signedToken,
      signedContent: content,
      instructions: 'Use the signedToken in Authorization header for POST requests'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Content signing failed',
      message: error.message
    });
  }
});

// ================================
// RESTful API ENDPOINTS
// ================================

/**
 * GET /api/posts
 * Retrieve all posts (public endpoint)
 */
app.get('/api/posts', (req, res) => {
  try {
    const postsWithAuthor = posts.map(post => {
      const author = users.find(u => u.id === post.authorId);
      return {
        ...post,
        author: author ? { username: author.username, email: author.email } : null
      };
    });

    res.json({
      message: 'Posts retrieved successfully',
      count: postsWithAuthor.length,
      posts: postsWithAuthor
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve posts',
      message: error.message
    });
  }
});

/**
 * GET /api/posts/:id
 * Retrieve a specific post by ID (public endpoint)
 */
app.get('/api/posts/:id', (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: `Post with ID ${postId} does not exist`
      });
    }

    const author = users.find(u => u.id === post.authorId);
    const postWithAuthor = {
      ...post,
      author: author ? { username: author.username, email: author.email } : null
    };

    res.json({
      message: 'Post retrieved successfully',
      post: postWithAuthor
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve post',
      message: error.message
    });
  }
});

/**
 * POST /api/posts
 * Create a new post (SECURED ENDPOINT)
 * 
 * Security Implementation:
 * 1. Requires valid JWT token (verifyToken middleware)
 * 2. Requires content signature verification (verifyContentSignature middleware)
 * 3. Ensures data integrity and user authentication
 * 
 * Usage Flow:
 * 1. Client calls /auth/sign-content with post data
 * 2. Client receives signed token
 * 3. Client uses signed token to call this endpoint
 */
app.post('/api/posts', verifyToken, verifyContentSignature, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'content']
      });
    }

    const newPost = {
      id: nextPostId++,
      title,
      content,
      authorId: req.user.userId,
      createdAt: new Date()
    };

    posts.push(newPost);

    const author = users.find(u => u.id === req.user.userId);
    const postWithAuthor = {
      ...newPost,
      author: author ? { username: author.username, email: author.email } : null
    };

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithAuthor
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create post',
      message: error.message
    });
  }
});

/**
 * PUT /api/posts/:id
 * Update an existing post (SECURED ENDPOINT)
 * 
 * Same security model as POST endpoint
 */
app.put('/api/posts/:id', verifyToken, verifyContentSignature, (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'content']
      });
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({
        error: 'Post not found',
        message: `Post with ID ${postId} does not exist`
      });
    }

    const post = posts[postIndex];

    // Check if user owns the post
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own posts'
      });
    }

    // Update post
    posts[postIndex] = {
      ...post,
      title,
      content,
      updatedAt: new Date()
    };

    const author = users.find(u => u.id === req.user.userId);
    const updatedPostWithAuthor = {
      ...posts[postIndex],
      author: author ? { username: author.username, email: author.email } : null
    };

    res.json({
      message: 'Post updated successfully',
      post: updatedPostWithAuthor
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update post',
      message: error.message
    });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post (requires authentication but not content signature)
 */
app.delete('/api/posts/:id', verifyToken, (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        error: 'Post not found',
        message: `Post with ID ${postId} does not exist`
      });
    }

    const post = posts[postIndex];

    // Check if user owns the post
    if (post.authorId !== req.user.userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own posts'
      });
    }

    posts.splice(postIndex, 1);

    res.json({
      message: 'Post deleted successfully',
      deletedPost: { id: postId, title: post.title }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete post',
      message: error.message
    });
  }
});

// ================================
// USER MANAGEMENT ENDPOINTS
// ================================

/**
 * GET /api/users
 * Get all users (requires authentication)
 */
app.get('/api/users', verifyToken, (req, res) => {
  try {
    const publicUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email
    }));

    res.json({
      message: 'Users retrieved successfully',
      count: publicUsers.length,
      users: publicUsers
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
});

/**
 * GET /api/users/me
 * Get current user profile (requires authentication)
 */
app.get('/api/users/me', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User associated with token no longer exists'
      });
    }

    res.json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      message: error.message
    });
  }
});

// ================================
// API DOCUMENTATION AND INFO
// ================================

/**
 * GET /api/info
 * API information and security documentation
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Secure RESTful API',
    version: '1.0.0',
    description: 'Full RESTful API with JWT-based security',
    security: {
      authentication: 'JWT Bearer tokens',
      postSecurity: 'Signed JWT tokens with content verification',
      features: [
        'Rate limiting',
        'CORS enabled',
        'Security headers (Helmet)',
        'Password hashing (bcrypt)',
        'Content signature verification for POST operations'
      ]
    },
    endpoints: {
      authentication: [
        'POST /auth/register - Register new user',
        'POST /auth/login - User login',
        'POST /auth/sign-content - Sign content for secure POST operations'
      ],
      posts: [
        'GET /api/posts - Get all posts (public)',
        'GET /api/posts/:id - Get specific post (public)',
        'POST /api/posts - Create post (secured with content signature)',
        'PUT /api/posts/:id - Update post (secured with content signature)',
        'DELETE /api/posts/:id - Delete post (authentication required)'
      ],
      users: [
        'GET /api/users - Get all users (authentication required)',
        'GET /api/users/me - Get current user profile (authentication required)'
      ]
    },
    usage: {
      basicAuth: 'Include "Authorization: Bearer <token>" header',
      securePost: [
        '1. Login to get authentication token',
        '2. Call /auth/sign-content with your POST data to get signed token',
        '3. Use signed token for POST/PUT operations'
      ]
    }
  });
});

/**
 * GET /
 * Root endpoint with welcome message
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Secure RESTful API!',
    documentation: '/api/info',
    health: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
    availableEndpoints: '/api/info'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Secure RESTful API server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/info`);
  console.log(`🔒 Security Features: JWT Authentication, Content Signatures, Rate Limiting`);
  console.log(`\n👤 Demo User Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: password123`);
});

module.exports = app;