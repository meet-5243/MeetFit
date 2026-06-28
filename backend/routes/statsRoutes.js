const express = require('express');
const router = express.Router();
const {
  getMuscleGroupStats,
  getExerciseStats,
  getSuggestionStats,
} = require('../controllers/statsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/muscle-group/:id', getMuscleGroupStats);
router.get('/exercise/:id', getExerciseStats);
router.get('/suggestion/:exerciseId', getSuggestionStats);

module.exports = router;
