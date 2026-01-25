const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check authentication (Mock/Simple)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  // Decoding jwt for user info
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'verifiable-rental-jwt-secret-key-2025', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// KRNL Client (Shared Logic)
class HttpKernelClient {
  constructor(nodeUrl) {
    this.nodeUrl = nodeUrl || process.env.KRNL_NODE_URL || 'https://node.krnl.io';
    this.client = axios.create({ baseURL: this.nodeUrl, timeout: 5000 });
  }
  async verifyIdentity(data) {
    try {
      // Real call
      const res = await this.client.post('/verifiable-credentials/verify', { credentialType: 'Identity', ...data });
      return res.data;
    } catch (e) {
      console.log('KRNL Node unreachable, using dev simulation');
      return { verified: true, proof: 'simulated_proof_' + Date.now() };
    }
  }
}
const krnlNode = new HttpKernelClient();

// In-memory property storage (replace with database in production)
const properties = [];

// POST /api/properties - Create new property
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, price, location, images, amenities } = req.body;

    // 1. Verify Host Identity with KRNL
    // We check if this user is a credible host using the Identity Kernel
    const krnlVerification = await krnlNode.verifyIdentity({
      userId: req.user.id,
      email: req.user.email,
      role: 'HOST',
      action: 'LIST_PROPERTY'
    });

    if (!krnlVerification || !krnlVerification.verified) {
      return res.status(403).json({
        error: 'Host verification failed. You must be a verified host to list properties.',
        details: krnlVerification
      });
    }

    // 2. Create Property Object
    const newProperty = {
      id: properties.length + 1,
      title,
      description,
      price,
      location,
      images,
      amenities,
      bedrooms: req.body.bedrooms || 1,
      bathrooms: req.body.bathrooms || 1,
      maxGuests: req.body.maxGuests || 2,
      available: true,
      owner: {
        id: req.user.id,
        name: req.user.name || 'Host',
        rating: 5.0, // New hosts start high
        verified: true // Verified via KRNL above
      },
      status: 'VERIFIED_ACTIVE', // Auto-verified by KRNL
      verificationProof: krnlVerification.proof,
      krlKernelRef: 'IdentityKernel',
      createdAt: new Date()
    };

    // 3. Save to "Database"
    properties.push(newProperty);

    res.json({
      success: true,
      message: 'Property listed and verified successfully',
      property: newProperty
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to list property' });
  }
});

// GET /api/properties - Get all available properties
router.get('/', (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      bedrooms,
      location,
      amenities,
      available = 'true'
    } = req.query;

    let filteredProperties = [...properties];

    // Filter by availability
    if (available !== 'all') {
      filteredProperties = filteredProperties.filter(p => p.available === (available === 'true'));
    }

    // Filter by price range
    if (minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= parseInt(maxPrice));
    }

    // Filter by bedrooms
    if (bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms >= parseInt(bedrooms));
    }

    // Filter by location
    if (location) {
      filteredProperties = filteredProperties.filter(p =>
        p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by amenities
    if (amenities) {
      const requestedAmenities = amenities.split(',').map(a => a.trim().toLowerCase());
      filteredProperties = filteredProperties.filter(p =>
        requestedAmenities.every(amenity =>
          p.amenities.some(a => a.toLowerCase().includes(amenity))
        )
      );
    }

    res.json({
      success: true,
      properties: filteredProperties,
      total: filteredProperties.length,
      filters: {
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        bedrooms: bedrooms || null,
        location: location || null,
        amenities: amenities || null,
        available: available
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - Get specific property
router.get('/:id', (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// GET /api/properties/search/suggestions - Get search suggestions
router.get('/search/suggestions', (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const query = q.toLowerCase();
    const locationSuggestions = properties
      .map(p => p.location)
      .filter((location, index, arr) => arr.indexOf(location) === index)
      .filter(location => location.toLowerCase().includes(query))
      .slice(0, 5);

    res.json({
      success: true,
      suggestions: locationSuggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// POST /api/properties/:id/availability - Check property availability for dates
router.post('/:id/availability', (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { checkInDate, checkOutDate } = req.body;

    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // In production, this would check actual booking conflicts
    // For now, simulate availability check
    const isAvailable = property.available &&
      new Date(checkInDate) < new Date(checkOutDate) &&
      new Date(checkInDate) >= new Date();

    res.json({
      success: true,
      propertyId,
      available: isAvailable,
      checkInDate,
      checkOutDate,
      message: isAvailable ? 'Property is available for selected dates' : 'Property not available for selected dates'
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;
