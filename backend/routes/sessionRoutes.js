const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} = require('../controllers/sessionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getSessions);
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;
