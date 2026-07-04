const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');

const router = express.Router();

router.route('/').post(asyncHandler(createVendor)).get(asyncHandler(getVendors));

router
  .route('/:id')
  .get(asyncHandler(getVendorById))
  .put(asyncHandler(updateVendor))
  .delete(asyncHandler(deleteVendor));

module.exports = router;
