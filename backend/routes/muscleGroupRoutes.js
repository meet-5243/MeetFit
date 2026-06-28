const express = require('express');
const router = express.Router();
const { getMuscleGroups } = require('../controllers/muscleGroupController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getMuscleGroups);

module.exports = router;
