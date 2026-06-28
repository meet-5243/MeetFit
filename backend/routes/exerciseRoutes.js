const express = require('express');
const router = express.Router();
const {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getExercises);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

module.exports = router;
