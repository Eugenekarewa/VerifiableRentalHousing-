const express = require('express');
const router = express.Router();

// Mock property data (replace with database in production)
const properties = [
  {
    id: 1,
    name: "Luxury Downtown Apartment",
    description: "Modern 2-bedroom apartment in the heart of the city with stunning skyline views",
    price: 200,
    location: "Downtown, City Center",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
    ],
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Gym Access", "Rooftop Terrace"],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    available: true,
    owner: {
      id: "owner_1",
      name: "Sarah Johnson",
      rating: 4.8,
      verified: true
    },
    policies: {
      checkIn: "3:00 PM",
      checkOut: "11:00 AM",
      cancellation: "flexible",
      smoking: false,
      pets: false,
      parties: false
    }
  },
  {
    id: 2,
    name: "Cozy Studio Near Park",
    description: "Perfect studio apartment with park views and modern amenities",
    price: 120,
    location: "Central Park Area",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800"
    ],
    amenities: ["WiFi", "Heating", "Kitchen", "Laundry", "City View"],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    available: true,
    owner: {
      id: "owner_2",
      name: "Mike Chen",
      rating: 4.6,
      verified: true
    },
    policies: {
      checkIn: "4:00 PM",
      checkOut: "10:00 AM",
      cancellation: "moderate",
      smoking: false,
      pets: true,
      parties: false
    }
  },
  {
    id: 3,
    name: "Modern Loft",
    description: "Spacious loft with high ceilings and natural light in the arts district",
    price: 300,
    location: "Arts District",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    amenities: ["WiFi", "Air Conditioning", "Kitchen", "Workspace", "Art Studio"],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    available: false,
    owner: {
      id: "owner_3",
      name: "Emma Rodriguez",
      rating: 4.9,
      verified: true
    },
    policies: {
      checkIn: "3:00 PM",
      checkOut: "12:00 PM",
      cancellation: "strict",
      smoking: false,
      pets: false,
      parties: false
    }
  },
  {
    id: 4,
    name: "Garden View House",
    description: "Charming house with beautiful garden views and outdoor space",
    price: 250,
    location: "Suburban Area",
    coordinates: { lat: 40.6782, lng: -73.9442 },
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"
    ],
    amenities: ["WiFi", "Garden", "BBQ", "Parking", "Pet Friendly"],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    available: true,
    owner: {
      id: "owner_4",
      name: "David Wilson",
      rating: 4.7,
      verified: true
    },
    policies: {
      checkIn: "4:00 PM",
      checkOut: "11:00 AM",
      cancellation: "flexible",
      smoking: false,
      pets: true,
      parties: true
    }
  },
  {
    id: 5,
    name: "Beachfront Condo",
    description: "Stunning ocean views from this modern condo with direct beach access",
    price: 400,
    location: "Beachfront",
    coordinates: { lat: 40.7282, lng: -73.9942 },
    images: [
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
    ],
    amenities: ["Ocean View", "WiFi", "Pool", "Beach Access", "Balcony"],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    available: true,
    owner: {
      id: "owner_5",
      name: "Lisa Thompson",
      rating: 4.9,
      verified: true
    },
    policies: {
      checkIn: "3:00 PM",
      checkOut: "11:00 AM",
      cancellation: "moderate",
      smoking: false,
      pets: false,
      parties: false
    }
  },
  {
    id: 6,
    name: "Mountain Cabin",
    description: "Rustic cabin with modern amenities perfect for nature lovers",
    price: 180,
    location: "Mountain Range",
    coordinates: { lat: 40.7614, lng: -73.9776 },
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800"
    ],
    amenities: ["Fireplace", "WiFi", "Kitchen", "Hiking Trails", "Mountain View"],
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    available: true,
    owner: {
      id: "owner_6",
      name: "Alex Green",
      rating: 4.5,
      verified: true
    },
    policies: {
      checkIn: "4:00 PM",
      checkOut: "10:00 AM",
      cancellation: "flexible",
      smoking: true,
      pets: true,
      parties: false
    }
  }
];

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
