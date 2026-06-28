const mongoose = require('mongoose');
const MuscleGroup = require('../models/MuscleGroup');

const initialMuscleGroups = [
  { name: 'Chest', slug: 'chest', icon: 'Flame', bodyPart: 'Upper Body' },
  { name: 'Back', slug: 'back', icon: 'Shield', bodyPart: 'Upper Body' },
  { name: 'Shoulders', slug: 'shoulders', icon: 'Zap', bodyPart: 'Upper Body' },
  { name: 'Biceps', slug: 'biceps', icon: 'Biceps', bodyPart: 'Arms' },
  { name: 'Triceps', slug: 'triceps', icon: 'Dumbbell', bodyPart: 'Arms' },
  { name: 'Legs', slug: 'legs', icon: 'Activity', bodyPart: 'Lower Body' },
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meetfit');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed muscle groups if database collection is empty
    const count = await MuscleGroup.countDocuments();
    if (count === 0) {
      await MuscleGroup.insertMany(initialMuscleGroups);
      console.log('🌱 Auto-seeded 6 default Muscle Groups into MongoDB database!');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
