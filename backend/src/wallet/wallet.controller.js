const express = require('express');
const crypto = require('crypto');
const { ethers } = require('ethers');
const router = express.Router();

// In-memory wallet storage (replace with secure database in production)
const wallets = new Map();
const keyStorage = new Map();

// Generate invisible wallet for user
function generateInvisibleWallet(userId, userEmail) {
  // Generate deterministic wallet based on user data
  const seed = crypto
    .createHash('sha256')
    .update(`${userId}:${userEmail}:${process.env.WALLET_SECRET || 'wallet-secret'}`)
    .digest('hex');

  const wallet = ethers.Wallet.fromPhrase(seed);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey, // In production, this would be encrypted
    publicKey: wallet.publicKey,
    derivationPath: `m/44'/60'/0'/0/0`,
    createdAt: new Date(),
    userId,
    userEmail
  };
}

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/wallet/create - Create invisible wallet for user
router.post('/create', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if wallet already exists
    if (wallets.has(userId)) {
      const existingWallet = wallets.get(userId);
      return res.json({
        success: true,
        address: existingWallet.address,
        message: 'Wallet already exists'
      });
    }

    // Generate new invisible wallet
    const wallet = generateInvisibleWallet(userId, userEmail);
    wallets.set(userId, wallet);

    // Store encrypted private key (simplified - use proper encryption in production)
    keyStorage.set(userId, {
      encryptedKey: wallet.privateKey, // In production: encrypt with user's session key
      encryptedAt: new Date()
    });

    // Update user in auth controller (would need database integration)
    res.json({
      success: true,
      address: wallet.address,
      message: 'Invisible wallet created successfully'
    });

  } catch (error) {
    console.error('Wallet creation error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// GET /api/wallet/address - Get user's wallet address
router.get('/address', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = wallets.get(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found. Please create wallet first.' });
    }

    res.json({
      success: true,
      address: wallet.address,
      createdAt: wallet.createdAt
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Failed to get wallet address' });
  }
});

// POST /api/wallet/sign - Sign transaction invisibly
router.post('/sign', authenticateToken, (req, res) => {
  try {
    const { transaction } = req.body;
    const userId = req.user.id;

    if (!transaction) {
      return res.status(400).json({ error: 'Transaction data required' });
    }

    const wallet = wallets.get(userId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Create ethers wallet instance
    const ethersWallet = new ethers.Wallet(wallet.privateKey);
    
    // Sign transaction (simplified - in production handle different transaction types)
    let signature;
    
    if (transaction.type === 'message') {
      signature = ethersWallet.signMessage(transaction.data);
    } else if (transaction.type === 'typedData') {
      signature = ethersWallet.signTypedData(transaction.data);
    } else {
      // For smart contract calls, you'd build the transaction object
      const tx = {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0x0',
        gasLimit: transaction.gasLimit || '0x5208',
        gasPrice: transaction.gasPrice
      };
      signature = ethersWallet.signTransaction(tx);
    }

    res.json({
      success: true,
      signature,
      signedAt: new Date(),
      walletAddress: wallet.address
    });

  } catch (error) {
    console.error('Transaction signing error:', error);
    res.status(500).json({ error: 'Failed to sign transaction' });
  }
});

// GET /api/wallet/balance - Get wallet balance (for monitoring)
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = wallets.get(userId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // In production, this would query the actual blockchain
    // For now, return mock balance
    res.json({
      success: true,
      address: wallet.address,
      balances: {
        ETH: '0.0', // Would be actual balance
        token: '0'
      },
      lastChecked: new Date()
    });

  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Failed to check balance' });
  }
});

// POST /api/wallet/gas-estimate - Estimate gas costs (for user display)
router.post('/gas-estimate', authenticateToken, (req, res) => {
  try {
    const { operation } = req.body;

    // Mock gas estimation based on operation type
    let gasEstimate;
    switch (operation) {
      case 'booking_request':
        gasEstimate = {
          gasLimit: '120000',
          gasPrice: '20000000000', // 20 gwei
          estimatedCost: '0.0024 ETH'
        };
        break;
      case 'booking_fulfill':
        gasEstimate = {
          gasLimit: '80000',
          gasPrice: '20000000000',
          estimatedCost: '0.0016 ETH'
        };
        break;
      case 'deposit_release':
        gasEstimate = {
          gasLimit: '60000',
          gasPrice: '20000000000',
          estimatedCost: '0.0012 ETH'
        };
        break;
      default:
        gasEstimate = {
          gasLimit: '100000',
          gasPrice: '20000000000',
          estimatedCost: '0.002 ETH'
        };
    }

    res.json({
      success: true,
      operation,
      gasEstimate,
      note: 'Gas fees are handled by our system - no cost to you!'
    });

  } catch (error) {
    console.error('Gas estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate gas' });
  }
});

module.exports = router;
