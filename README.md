# Secure RESTful API with JWT-based Security

A comprehensive RESTful API implementation featuring advanced JWT-based authentication with content signature verification for POST operations.

## 🌟 Features

- **Complete RESTful API** with CRUD operations
- **JWT Authentication** for user management
- **Signed JWT Tokens** for POST operation security
- **Content Integrity Verification** to prevent data tampering
- **Rate Limiting** to prevent API abuse
- **Security Headers** with Helmet.js
- **Password Hashing** with bcrypt
- **CORS Support** for cross-origin requests
- **Comprehensive Error Handling**
- **Detailed API Documentation**

## 🔐 Security Architecture

### Standard Authentication
- JWT tokens for user authentication
- Bearer token authorization headers
- Password hashing with bcrypt

### Enhanced POST Security
For POST and PUT operations, this API implements a unique two-step security process:

1. **Content Signing**: User calls `/auth/sign-content` with their data
2. **Signature Verification**: Server verifies both user auth AND content integrity
3. **Tamper Prevention**: Any modification to signed content is detected and rejected

This prevents:
- Data tampering attacks
- Replay attacks with modified content
- Unauthorized content injection

## 🚀 Quick Start

### Installation
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

### Demo Usage
```bash
# The server includes a demo user:
# Username: admin
# Password: password123

# Test the API
node test-api.js
```

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User authentication
- `POST /auth/sign-content` - Sign content for secure POST operations

### Posts (RESTful CRUD)
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/:id` - Get specific post (public)
- `POST /api/posts` - Create post (requires signed JWT)
- `PUT /api/posts/:id` - Update post (requires signed JWT)
- `DELETE /api/posts/:id` - Delete post (requires authentication)

### Users
- `GET /api/users` - Get all users (authenticated)
- `GET /api/users/me` - Get current user profile (authenticated)

### Information
- `GET /` - Welcome message
- `GET /api/info` - Complete API documentation

## 🛡️ Security Implementation Example

```javascript
// Step 1: Login to get authentication token
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password123' })
});
const { token } = await loginResponse.json();

// Step 2: Sign your content
const content = { title: 'My Post', content: 'Post content' };
const signResponse = await fetch('/auth/sign-content', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(content)
});
const { signedToken } = await signResponse.json();

// Step 3: Create post with signed token
const postResponse = await fetch('/api/posts', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${signedToken}`
  },
  body: JSON.stringify(content) // Must match signed content exactly
});
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Start the server first
npm run dev

# In another terminal, run tests
node test-api.js
```

The test script validates:
- User registration and authentication
- Public endpoint access
- Protected endpoint security
- Content signing mechanism
- Signature verification
- Data integrity validation
- CRUD operations
- Error handling

## 📖 Documentation

- **Complete API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Interactive API Info**: Visit `/api/info` when server is running
- **Code Comments**: Extensive inline documentation explaining security implementation

## 🛠️ Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## 🔧 Configuration

Environment variables (optional, defaults provided):

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CONTENT_SECRET=content-signature-secret-key
PORT=3000
NODE_ENV=development
```

## 📝 Demo Credentials

For testing and development:
- **Username**: `admin`
- **Password**: `password123`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

ISC License - see LICENSE file for details.

## 🎯 Learning Objectives

This project demonstrates:
- RESTful API design principles
- JWT authentication implementation
- Advanced security with content signing
- Express.js middleware usage
- Error handling and validation
- API documentation and testing
- Security best practices
