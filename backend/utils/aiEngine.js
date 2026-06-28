/**
 * AI Smart Target Suggestion Engine
 * Calculates e1RM, evaluates double progression rules, and detects deload needs.
 */

// Helper: Epley Formula
const calculateE1RM = (weight, reps) => {
  if (!weight || !reps) return 0;
  if (reps === 1) return weight;
  return Math.round((weight * (1 + reps / 30)) * 10) / 10;
};

const generateSuggestion = (sessions) => {
  // If no previous sessions exist, return default beginner targets
  if (!sessions || sessions.length === 0) {
    return {
      hasData: false,
      title: "🎯 Target for Today",
      targets: [
        { setNumber: 1, weight: 20, reps: 10 },
        { setNumber: 2, weight: 20, reps: 10 },
        { setNumber: 3, weight: 20, reps: 10 }
      ],
      explanation: "No previous sessions logged yet. Start with a light warmup weight to establish your baseline e1RM!",
      estimated1RM: 26.7,
      e1RMChange: 0
    };
  }

  // Sort sessions by date ascending
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const recentSessions = sortedSessions.slice(-4); // Last 4 sessions
  const lastSession = sortedSessions[sortedSessions.length - 1];

  // Find best set of last session (highest e1RM)
  let bestSetLastSession = null;
  let maxE1RM = 0;

  if (lastSession.sets && lastSession.sets.length > 0) {
    lastSession.sets.forEach(s => {
      const e1rm = calculateE1RM(s.weight, s.reps);
      if (e1rm > maxE1RM) {
        maxE1RM = e1rm;
        bestSetLastSession = s;
      }
    });
  }

  if (!bestSetLastSession) {
    bestSetLastSession = { weight: 20, reps: 10, unit: 'kg' };
  }

  const currentWeight = bestSetLastSession.weight;
  const currentReps = bestSetLastSession.reps;
  const unit = bestSetLastSession.unit || 'kg';

  // Historical e1RM (e.g. 4 sessions ago vs current)
  const firstSessionE1RM = sortedSessions.length >= 4 
    ? Math.max(...sortedSessions[0].sets.map(s => calculateE1RM(s.weight, s.reps)))
    : maxE1RM;
  const e1RMChange = Math.round((maxE1RM - firstSessionE1RM) * 10) / 10;

  // Step 3: Check Volume Trends (last 4 sessions)
  const sessionVolumes = sortedSessions.map(sess => {
    return sess.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
  });

  let isDeloadNeeded = false;
  if (sessionVolumes.length >= 3) {
    const len = sessionVolumes.length;
    // Check if volume has dropped or stagnated over last 2 consecutive intervals
    if (sessionVolumes[len - 1] <= sessionVolumes[len - 2] && sessionVolumes[len - 2] <= sessionVolumes[len - 3]) {
      isDeloadNeeded = true;
    }
  }

  // Decision logic
  let targetWeight = currentWeight;
  let targetReps = currentReps;
  let explanation = "";
  const numSets = Math.max(lastSession.sets ? lastSession.sets.length : 3, 3);
  let targets = [];

  if (isDeloadNeeded) {
    // Deload logic: reduce weight by 10%, maintain reps
    targetWeight = Math.max(5, Math.round((currentWeight * 0.9) * 2) / 2); // rounded to nearest 0.5/2.5
    targetReps = currentReps;
    explanation = `Volume has stagnated or declined over recent sessions. Time for a recovery deload! Reduce weight by 10% to ${targetWeight} ${unit} while maintaining your rep target.`;
  } else {
    // Double Progression rule:
    const REP_CEILING = 12;
    const REP_FLOOR = 8;

    if (currentReps < REP_CEILING) {
      // Suggest +1-2 reps at same weight
      targetReps = Math.min(REP_CEILING, currentReps + 1);
      targetWeight = currentWeight;
      explanation = `Last session you completed ${currentWeight} ${unit} × ${currentReps} reps. Next step: Keep the weight at ${targetWeight} ${unit} and push for ${targetReps} reps on all sets.`;
    } else {
      // Reached rep ceiling (12) -> bump weight by 2.5kg (or 5lbs) and drop back to floor reps (8)
      const increment = unit === 'lbs' ? 5 : 2.5;
      targetWeight = currentWeight + increment;
      targetReps = REP_FLOOR;
      explanation = `Awesome job! Last session you hit ${currentWeight} ${unit} × ${currentReps} reps on your best set! Bump weight to ${targetWeight} ${unit}, start at ${targetReps} reps and work your way back up.`;
    }
  }

  // Generate set targets (e.g. Set 1, Set 2, Set 3)
  for (let i = 1; i <= numSets; i++) {
    targets.push({
      setNumber: i,
      weight: targetWeight,
      reps: targetReps,
      unit
    });
  }

  return {
    hasData: true,
    title: "🎯 Target for Today",
    targets,
    explanation,
    estimated1RM: maxE1RM,
    e1RMChange,
    isDeload: isDeloadNeeded
  };
};

module.exports = { calculateE1RM, generateSuggestion };
