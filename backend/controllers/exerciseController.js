const Exercise = require('../models/Exercise');
const Session = require('../models/Session');
const { calculateE1RM } = require('../utils/aiEngine');

// @desc    Get exercises for a muscle group (scoped to user)
// @route   GET /api/exercises?muscleGroupId=xxx
const getExercises = async (req, res) => {
  try {
    const { muscleGroupId } = req.query;
    const query = { userId: req.user._id };
    
    if (muscleGroupId) {
      query.muscleGroupId = muscleGroupId;
    }

    const exercises = await Exercise.find(query).sort({ createdAt: -1 });

    const enrichedExercises = await Promise.all(
      exercises.map(async (ex) => {
        const sessions = await Session.find({
          userId: req.user._id,
          exerciseId: ex._id,
        }).sort({ date: -1 });

        let bestSet = null;
        let maxE1RM = 0;

        if (sessions.length > 0 && sessions[0].sets && sessions[0].sets.length > 0) {
          sessions[0].sets.forEach((s) => {
            const e1rm = calculateE1RM(s.weight, s.reps);
            if (e1rm >= maxE1RM) {
              maxE1RM = e1rm;
              bestSet = s;
            }
          });
        }

        return {
          _id: ex._id,
          userId: ex.userId,
          muscleGroupId: ex.muscleGroupId,
          name: ex.name,
          notes: ex.notes,
          createdAt: ex.createdAt,
          totalSessions: sessions.length,
          lastSessionBestSet: bestSet
            ? `${bestSet.weight} ${bestSet.unit || 'kg'} × ${bestSet.reps}`
            : 'No sets logged yet',
        };
      })
    );

    res.json(enrichedExercises);
  } catch (error) {
    console.error('Error getting exercises:', error);
    res.status(500).json({ message: 'Server error fetching exercises' });
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
const createExercise = async (req, res) => {
  try {
    const { muscleGroupId, name, notes } = req.body;

    if (!muscleGroupId || !name) {
      return res.status(400).json({ message: 'Muscle group ID and exercise name are required' });
    }

    const exercise = await Exercise.create({
      userId: req.user._id,
      muscleGroupId,
      name,
      notes: notes || '',
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ message: 'Server error creating exercise' });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
const updateExercise = async (req, res) => {
  try {
    const { name, notes } = req.body;
    const exercise = await Exercise.findOne({ _id: req.params.id, userId: req.user._id });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    if (name) exercise.name = name;
    if (notes !== undefined) exercise.notes = notes;

    await exercise.save();
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating exercise' });
  }
};

// @desc    Delete exercise and its sessions
// @route   DELETE /api/exercises/:id
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Also delete all recorded sessions for this exercise
    await Session.deleteMany({ exerciseId: req.params.id, userId: req.user._id });

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting exercise' });
  }
};

module.exports = { getExercises, createExercise, updateExercise, deleteExercise };
