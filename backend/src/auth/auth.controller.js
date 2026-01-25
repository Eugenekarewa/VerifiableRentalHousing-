const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// In-memory user storage (replace with database in production)
const users = new Map();
const sessions = new Map();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate device trust
function generateDeviceTrust() {
  return {
    deviceId: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    trustLevel: 'standard',
    createdAt: new Date(),
    lastSeen: new Date()
  };
}

// Helper function to create user response
function createUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role || 'GUEST',
    hasWallet: !!user.walletAddress,
    isVerified: user.isVerified || false,
    authProvider: user.authProvider,
    createdAt: user.createdAt
  };
}

// POST /api/auth/google - Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = users.get(email);

    if (!user) {
      // Create new user with default GUEST role
      user = {
        id: googleId,
        email,
        name,
        picture,
        role: 'GUEST', // Default role for new users
        authProvider: 'google',
        walletAddress: null,
        isVerified: false,
        createdAt: new Date(),
        deviceTrust: generateDeviceTrust()
      };
      users.set(email, user);
    } else {
      // Update user info
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
    }

    // Generate JWT token with role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/google/init - Initialize Google OAuth flow
router.get('/google/init', (req, res) => {
  // This endpoint would redirect to Google OAuth
  // For now, return instructions for the OAuth flow
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return res.status(400).json({ error: 'Google OAuth not configured' });
  }

  const redirectUri = `${process.env.API_URL || 'http://localhost:3001'}/api/auth/google/callback`;
  const scope = 'openid email profile';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;

  res.json({ authUrl });
});

// POST /api/auth/google/callback - Handle Google OAuth callback
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    const idToken = tokens.id_token;

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = users.get(email);

    if (!user) {
      // Create new user with default GUEST role
      user = {
        id: googleId,
        email,
        name,
        picture,
        role: 'GUEST', // Default role for new users
        authProvider: 'google',
        walletAddress: null,
        isVerified: false,
        createdAt: new Date(),
        deviceTrust: generateDeviceTrust()
      };
      users.set(email, user);
    } else {
      // Update user info
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
    }

    // Generate JWT token with role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/email/register - Email/password registration
router.post('/email/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate role (default to GUEST if not provided or invalid)
    const validRoles = ['GUEST', 'HOST'];
    const userRole = role && validRoles.includes(role) ? role : 'GUEST';

    // Create user
    const user = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      password: hashedPassword,
      role: userRole,
      authProvider: 'email',
      walletAddress: null,
      isVerified: false,
      createdAt: new Date(),
      deviceTrust: generateDeviceTrust()
    };

    users.set(email, user);

    // Generate JWT token with role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/email/login - Email/password login
router.post('/email/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);

    if (!user || user.authProvider !== 'email') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT token with role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: createUserResponse(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you'd blacklist the token or remove from session store
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/profile - Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(createUserResponse(user));
});

// GET /api/auth/me - Get current user (alternative endpoint)
router.get('/me', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    success: true,
    user: createUserResponse(user)
  });
});

// POST /api/auth/update-role - Update user role (admin only in production)
router.post('/update-role', authenticateToken, (req, res) => {
  const { role } = req.body;
  const validRoles = ['GUEST', 'HOST', 'ADMIN'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be GUEST, HOST, or ADMIN' });
  }

  const user = users.get(req.user.email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user role
  user.role = role;

  res.json({
    success: true,
    user: createUserResponse(user)
  });
});

module.exports = router;
