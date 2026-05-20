const express = require('express');
const router = express.Router();
const {
  getListings,
  createListing,
  wishlistListing,
  reportListing,
  deleteListing,
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all marketplace routes

router.get('/', getListings);
router.post('/', createListing);
router.post('/:id/wishlist', wishlistListing);
router.post('/:id/report', reportListing);
router.delete('/:id', deleteListing);

module.exports = router;
