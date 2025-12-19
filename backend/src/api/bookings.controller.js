const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();


// Contract configuration (same as frontend)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x17D6eD93bFccb90e6E7e862BAd3D27Af45ab46ca';
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_verifier", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "propertyId", "type": "uint256" }
    ],
    "name": "BookingRequested",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
      { "internalType": "bytes", "name": "encryptedUserData", "type": "bytes" }
    ],
    "name": "requestBooking",
    "outputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" },
      { "internalType": "bytes", "name": "krnlAttestation", "type": "bytes" }
    ],
    "name": "fulfillBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bookingId", "type": "uint256" }
    ],
    "name": "getBooking",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "tenant", "type": "address" },
          { "internalType": "uint256", "name": "propertyId", "type": "uint256" },
          { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "checkInDate", "type": "uint256" },
          { "internalType": "uint256", "name": "checkOutDate", "type": "uint256" },
          { "internalType": "bytes32", "name": "verificationHash", "type": "bytes32" },
          { "internalType": "uint8", "name": "status", "type": "uint8" }
        ],
        "internalType": "struct VerifiableRental.Booking",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNextBookingId",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Mock booking storage (replace with database in production)
const bookings = new Map();
const userBookings = new Map();

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Get user's wallet address from wallet service
    const walletController = require('../wallet/wallet.controller');
    const wallet = walletController.getWallet(user.id);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found. Please create wallet first.' });
    }
    
    req.user = { ...user, walletAddress: wallet.address };
    next();
  });
};

// POST /api/bookings/create - Create new booking invisibly
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { 
      propertyId, 
      checkInDate, 
      checkOutDate, 
      guests, 
      specialRequests,
      paymentMethod 
    } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        error: 'Property ID, check-in date, and check-out date are required' 
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    if (checkIn < new Date()) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }



    // Get user's wallet for blockchain interaction
    const walletModule = require('../wallet/wallet.controller');
    const userWallet = walletModule.getWallet ? 
      walletModule.getWallet(req.user.id) : 
      { address: '0x742d35Cc6634C0532925a3b8D4075Ff4E', privateKey: 'mock_private_key' };

    if (!userWallet || !userWallet.address) {
      return res.status(404).json({ error: 'Wallet not found. Please create wallet first.' });
    }
    
    // Prepare booking data
    const bookingData = {
      tenantId: req.user.id,
      tenantEmail: req.user.email,
      walletAddress: userWallet.address,
      propertyId,
      checkInDate,
      checkOutDate,
      guests: guests || 1,
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || 'card',
      createdAt: new Date(),
      status: 'processing'
    };

    // Encrypt user data for blockchain
    const encryptedUserData = encryptUserData(bookingData);


    try {
      // Create booking on blockchain invisibly
      const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
      const wallet = new ethers.Wallet(userWallet.privateKey, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

      // Estimate gas and submit transaction
      const gasEstimate = await contract.requestBooking.estimateGas(propertyId, encryptedUserData);
      
      const tx = await contract.requestBooking(propertyId, encryptedUserData, {
        gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract booking ID from transaction receipt
      let bookingId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === 'BookingRequested') {
            bookingId = parsedLog.args.bookingId.toString();
            break;
          }
        } catch (e) {
          // Not our event, continue
          continue;
        }
      }
      
      if (!bookingId) {
        // Fallback to getNextBookingId
        const nextId = await contract.getNextBookingId();
        bookingId = (nextId - 1n).toString();
      }

      // Store booking in database
      const booking = {
        id: bookingId,
        ...bookingData,
        transactionHash: tx.hash,
        blockchainStatus: 'confirmed',
        status: 'confirmed'
      };

      bookings.set(bookingId, booking);
      
      if (!userBookings.has(req.user.id)) {
        userBookings.set(req.user.id, []);
      }
      userBookings.get(req.user.id).push(bookingId);

      res.json({
        success: true,
        bookingId,
        message: 'Booking created successfully',
        booking: {
          id: bookingId,
          propertyId,
          checkInDate,
          checkOutDate,
          status: 'confirmed',
          confirmationCode: generateConfirmationCode(bookingId)
        }
      });

    } catch (blockchainError) {
      console.error('Blockchain interaction error:', blockchainError);
      
      // Fallback: create booking without blockchain (for demo)
      const bookingId = generateBookingId();
      const booking = {
        id: bookingId,
        ...bookingData,
        transactionHash: 'demo_transaction_hash',
        blockchainStatus: 'pending',
        status: 'confirmed',
        isDemo: true
      };

      bookings.set(bookingId, booking);
      
      if (!userBookings.has(req.user.id)) {
        userBookings.set(req.user.id, []);
      }
      userBookings.get(req.user.id).push(bookingId);

      res.json({
        success: true,
        bookingId,
        message: 'Booking created successfully (demo mode)',
        booking: {
          id: bookingId,
          propertyId,
          checkInDate,
          checkOutDate,
          status: 'confirmed',
          confirmationCode: generateConfirmationCode(bookingId),
          note: 'This is a demo booking - no real blockchain transaction'
        }
      });
    }

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/user - Get user's bookings
router.get('/user', authenticateToken, (req, res) => {
  try {
    const userBookingIds = userBookings.get(req.user.id) || [];
    const userBookingsList = userBookingIds.map(id => bookings.get(id)).filter(Boolean);

    res.json({
      success: true,
      bookings: userBookingsList.map(booking => ({
        id: booking.id,
        propertyId: booking.propertyId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status,
        confirmationCode: generateConfirmationCode(booking.id),
        createdAt: booking.createdAt
      })),
      total: userBookingsList.length
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id - Get specific booking
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.tenantId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      booking: {
        id: booking.id,
        propertyId: booking.propertyId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.guests,
        status: booking.status,
        confirmationCode: generateConfirmationCode(booking.id),
        createdAt: booking.createdAt,
        blockchainStatus: booking.blockchainStatus,
        isDemo: booking.isDemo || false
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.tenantId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    bookings.set(bookingId, booking);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      bookingId,
      refundPolicy: 'Full refund if cancelled 24 hours before check-in'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Helper functions
function encryptUserData(data) {
  // In production, use proper encryption
  const jsonString = JSON.stringify(data);
  return ethers.toUtf8Bytes(jsonString);
}


function generateConfirmationCode(bookingId) {
  return `VR-${bookingId.toString().padStart(6, '0')}`;
}

module.exports = router;
