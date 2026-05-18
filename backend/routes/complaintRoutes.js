const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Mount authentication protector globally on all complaint operations
router.use(protect);

router.route('/')
  .post(upload.single('image'), createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById)
  .put(upload.single('image'), updateComplaint)
  .delete(deleteComplaint);

module.exports = router;
