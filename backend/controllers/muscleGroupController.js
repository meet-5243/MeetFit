const MuscleGroup = require('../models/MuscleGroup');
const Exercise = require('../models/Exercise');
const Session = require('../models/Session');

// @desc    Get all muscle groups with exercise count and last trained date for user
// @route   GET /api/muscle-groups
const getMuscleGroups = async (req, res) => {
  try {
    const muscleGroups = await MuscleGroup.find({}).sort({ name: 1 });
    
    // Enrich with user's specific data if logged in
    const enrichedGroups = await Promise.all(
      muscleGroups.map(async (group) => {
        const exercises = await Exercise.find({
          userId: req.user._id,
          muscleGroupId: group._id,
        });

        const exerciseIds = exercises.map((e) => e._id);
        
        const lastSession = await Session.findOne({
          userId: req.user._id,
          exerciseId: { $in: exerciseIds },
        }).sort({ date: -1 });

        return {
          _id: group._id,
          name: group.name,
          slug: group.slug,
          icon: group.icon,
          bodyPart: group.bodyPart,
          exerciseCount: exercises.length,
          lastTrained: lastSession ? lastSession.date : null,
        };
      })
    );

    res.json(enrichedGroups);
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    res.status(500).json({ message: 'Server error fetching muscle groups' });
  }
};

module.exports = { getMuscleGroups };
