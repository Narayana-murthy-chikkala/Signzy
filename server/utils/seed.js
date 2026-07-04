// Populates sample vendors for local development/testing.
// Run with: npm run seed (inside server/)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Vendor = require('../models/Vendor');

// Deliberately covers all 5 capabilities from the brief (PAN_VERIFICATION,
// OCR, SMS, PAYMENT_PROCESSING, DOCUMENT_VALIDATION) with exactly 2
// healthy+active vendors each (A/B/C), plus D (unhealthy) and E (down) each
// touching a couple of capabilities so the exclusion/failover behavior is
// visible for every capability, not just one.
const sampleVendors = [
  {
    name: 'Vendor A',
    priority: 5,
    weight: 5,
    costPerRequest: 0.1,
    timeoutMs: 2000,
    rateLimitPerMinute: 100,
    supportedFeatures: ['PAN_VERIFICATION', 'OCR', 'SMS'],
    healthStatus: 'healthy',
    isActive: true,
  },
  {
    name: 'Vendor B',
    priority: 3,
    weight: 3,
    costPerRequest: 0.05,
    timeoutMs: 1500,
    rateLimitPerMinute: 50,
    supportedFeatures: ['PAN_VERIFICATION', 'PAYMENT_PROCESSING', 'DOCUMENT_VALIDATION'],
    healthStatus: 'healthy',
    isActive: true,
  },
  {
    name: 'Vendor C',
    priority: 4,
    weight: 4,
    costPerRequest: 0.2,
    timeoutMs: 3000,
    rateLimitPerMinute: 200,
    supportedFeatures: ['OCR', 'SMS', 'PAYMENT_PROCESSING', 'DOCUMENT_VALIDATION'],
    healthStatus: 'healthy',
    isActive: true,
  },
  {
    name: 'Vendor D',
    priority: 2,
    weight: 2,
    costPerRequest: 0.02,
    timeoutMs: 1000,
    rateLimitPerMinute: 30,
    supportedFeatures: ['PAN_VERIFICATION', 'DOCUMENT_VALIDATION'],
    healthStatus: 'unhealthy',
    isActive: true,
  },
  {
    name: 'Vendor E',
    priority: 1,
    weight: 1,
    costPerRequest: 0.15,
    timeoutMs: 2500,
    rateLimitPerMinute: 100,
    supportedFeatures: ['OCR', 'SMS', 'PAYMENT_PROCESSING'],
    healthStatus: 'healthy',
    isActive: false,
  },
];

const seed = async () => {
  await connectDB();
  await Vendor.deleteMany({});
  await Vendor.insertMany(sampleVendors);
  console.log(`Seeded ${sampleVendors.length} vendors`);
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
