const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all marketplace product listings
// @route   GET /api/marketplace
const getListings = async (req, res, next) => {
  try {
    const { category, search, wishlistOnly } = req.query;
    let query = { status: 'available' };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (wishlistOnly === 'true') {
      query.wishlist = req.user._id;
    }

    const listings = await Product.find(query)
      .populate('seller', 'name role avatar dept year xp level email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product listing
// @route   POST /api/marketplace
const createListing = async (req, res, next) => {
  try {
    const { title, description, price, category, image } = req.body;

    if (!title || !description || price === undefined) {
      res.status(400);
      throw new Error('Title, description and price are required parameters');
    }

    const listing = await Product.create({
      title,
      description,
      price: parseFloat(price),
      category: category || 'others',
      image: image || '',
      seller: req.user._id,
    });

    // Award 5 XP points for listings creation
    req.user.xp += 5;
    if (req.user.xp >= req.user.level * 50) {
      req.user.level += 1;
      req.user.badges.push(`Level ${req.user.level} Merchant`);
    }
    await req.user.save();

    const populatedListing = await Product.findById(listing._id)
      .populate('seller', 'name role avatar dept year xp level email');

    res.status(201).json({
      success: true,
      message: 'Product listing successfully created!',
      data: populatedListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item on wishlist
// @route   POST /api/marketplace/:id/wishlist
const wishlistListing = async (req, res, next) => {
  try {
    const listing = await Product.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    const index = listing.wishlist.indexOf(req.user._id);
    if (index > -1) {
      listing.wishlist.splice(index, 1); // Remove
    } else {
      listing.wishlist.push(req.user._id); // Add
    }

    await listing.save();
    res.json({
      success: true,
      data: listing.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report listing scam / inappropriate listing
// @route   POST /api/marketplace/:id/report
const reportListing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const listing = await Product.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    listing.reports.push({
      reporter: req.user._id,
      reason: reason || 'Suspicious seller listing',
    });

    await listing.save();
    res.json({
      success: true,
      message: 'Listing reported to campus moderation successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/marketplace/:id
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Product.findById(req.params.id);

    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }

    // Auth check: Admin or Seller
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this product listing');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Listing successfully removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListings,
  createListing,
  wishlistListing,
  reportListing,
  deleteListing,
};
