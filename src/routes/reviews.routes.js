const express = require('express');
const router = express.Router();
const { createReview, getBookReviews } = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/:id/reviews', getBookReviews);
router.post('/:id/reviews', authenticate, createReview);

module.exports = router;