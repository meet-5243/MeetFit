const Session = require('../models/Session');
const Exercise = require('../models/Exercise');
const MuscleGroup = require('../models/MuscleGroup');
const { calculateE1RM, generateSuggestion } = require('../utils/aiEngine');

// Helper to get ISO week key
const getWeekKey = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `W${weekNo}`;
};

// @desc    Get weekly volume aggregate for a muscle group (last 12 weeks)
// @route   GET /api/stats/muscle-group/:id
const getMuscleGroupStats = async (req, res) => {
  try {
    const muscleGroupId = req.params.id;
    const muscleGroup = await MuscleGroup.findById(muscleGroupId);

    if (!muscleGroup) {
      return res.status(404).json({ message: 'Muscle group not found' });
    }

    // Find all exercises belonging to this muscle group for this user
    const exercises = await Exercise.find({
      userId: req.user._id,
      muscleGroupId,
    });

    const exerciseIds = exercises.map((e) => e._id);

    // Fetch all sessions for these exercises
    const sessions = await Session.find({
      userId: req.user._id,
      exerciseId: { $in: exerciseIds },
    }).sort({ date: 1 });

    // Build past 12 weeks structure
    const weeksMap = {};
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - (i * 7));
      const weekLabel = getWeekKey(d);
      weeksMap[weekLabel] = 0;
    }

    // Accumulate total weekly volume = sum of (sets × reps × weight)
    sessions.forEach((sess) => {
      const weekLabel = getWeekKey(sess.date);
      let sessionVol = 0;
      if (sess.sets && sess.sets.length > 0) {
        sess.sets.forEach((s) => {
          sessionVol += s.weight * s.reps;
        });
      }
      if (weeksMap[weekLabel] !== undefined) {
        weeksMap[weekLabel] += sessionVol;
      }
    });

    const chartData = Object.keys(weeksMap).map((w) => ({
      week: w,
      volume: weeksMap[w],
    }));

    // Calculate current week vs last week % change
    const weekKeys = Object.keys(weeksMap);
    const currentVol = weeksMap[weekKeys[weekKeys.length - 1]] || 0;
    const prevVol = weeksMap[weekKeys[weekKeys.length - 2]] || 0;

    let percentChange = 0;
    if (prevVol > 0) {
      percentChange = Math.round(((currentVol - prevVol) / prevVol) * 100);
    } else if (currentVol > 0) {
      percentChange = 100;
    }

    res.json({
      muscleGroup: muscleGroup.name,
      icon: muscleGroup.icon,
      currentVolume: currentVol,
      prevVolume: prevVol,
      percentChange,
      weeklyData: chartData,
    });
  } catch (error) {
    console.error('Error in muscle group stats:', error);
    res.status(500).json({ message: 'Server error fetching muscle group stats' });
  }
};

// @desc    Get detailed exercise progression stats (Volume, e1RM, Best Set per session)
// @route   GET /api/stats/exercise/:id
const getExerciseStats = async (req, res) => {
  try {
    const exerciseId = req.params.id;
    const exercise = await Exercise.findOne({ _id: exerciseId, userId: req.user._id });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const sessions = await Session.find({
      userId: req.user._id,
      exerciseId,
    }).sort({ date: 1 });

    const sessionStats = sessions.map((sess) => {
      const dateStr = new Date(sess.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      let totalVolume = 0;
      let maxE1RM = 0;
      let maxWeight = 0;
      let maxReps = 0;

      if (sess.sets && sess.sets.length > 0) {
        sess.sets.forEach((s) => {
          totalVolume += s.weight * s.reps;
          const e1rm = calculateE1RM(s.weight, s.reps);
          if (e1rm > maxE1RM) {
            maxE1RM = e1rm;
          }
          if (s.weight > maxWeight) {
            maxWeight = s.weight;
            maxReps = s.reps;
          }
        });
      }

      return {
        sessionId: sess._id,
        date: dateStr,
        fullDate: sess.date,
        volume: totalVolume,
        e1RM: maxE1RM,
        bestWeight: maxWeight,
        bestReps: maxReps,
        sets: sess.sets,
      };
    });

    // Determine overall PR weight
    const overallMaxWeight = sessionStats.length > 0
      ? Math.max(...sessionStats.map((s) => s.bestWeight))
      : 0;

    const enrichedSessionStats = sessionStats.map((s) => ({
      ...s,
      isPR: s.bestWeight > 0 && s.bestWeight === overallMaxWeight,
    }));

    res.json({
      exerciseName: exercise.name,
      sessions: enrichedSessionStats,
    });
  } catch (error) {
    console.error('Error in exercise stats:', error);
    res.status(500).json({ message: 'Server error fetching exercise stats' });
  }
};

// @desc    Get AI target suggestion for an exercise
// @route   GET /api/stats/suggestion/:exerciseId
const getSuggestionStats = async (req, res) => {
  try {
    const exerciseId = req.params.exerciseId;
    const sessions = await Session.find({
      userId: req.user._id,
      exerciseId,
    }).sort({ date: 1 });

    const suggestion = generateSuggestion(sessions);
    res.json(suggestion);
  } catch (error) {
    console.error('Error generating suggestion:', error);
    res.status(500).json({ message: 'Server error generating suggestion' });
  }
};

module.exports = { getMuscleGroupStats, getExerciseStats, getSuggestionStats };
