const Session = require('../models/Session');

// @desc    Get sessions for exercise
// @route   GET /api/sessions?exerciseId=xxx&limit=50
const getSessions = async (req, res) => {
  try {
    const { exerciseId, limit = 50 } = req.query;
    const query = { userId: req.user._id };

    if (exerciseId) {
      query.exerciseId = exerciseId;
    }

    const sessions = await Session.find(query)
      .populate('exerciseId')
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
};

// @desc    Create new workout session (or log sets)
// @route   POST /api/sessions
const createSession = async (req, res) => {
  try {
    const { exerciseId, date, sets, notes } = req.body;

    if (!exerciseId || !sets || !Array.isArray(sets)) {
      return res.status(400).json({ message: 'Exercise ID and valid sets array are required' });
    }

    const session = await Session.create({
      userId: req.user._id,
      exerciseId,
      date: date || new Date(),
      sets,
      notes: notes || '',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error creating session' });
  }
};

// @desc    Update existing session
// @route   PUT /api/sessions/:id
const updateSession = async (req, res) => {
  try {
    const { sets, notes, date } = req.body;
    const session = await Session.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (sets) session.sets = sets;
    if (notes !== undefined) session.notes = notes;
    if (date) session.date = date;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating session' });
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting session' });
  }
};

module.exports = { getSessions, createSession, updateSession, deleteSession };
