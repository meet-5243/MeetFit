const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MuscleGroup = require('../models/MuscleGroup');

dotenv.config({ path: '../.env' });
if (!process.env.MONGO_URI) {
  dotenv.config();
}

const muscleGroups = [
  { name: 'Chest', slug: 'chest', icon: 'Flame', bodyPart: 'Upper Body' },
  { name: 'Back', slug: 'back', icon: 'Shield', bodyPart: 'Upper Body' },
  { name: 'Shoulders', slug: 'shoulders', icon: 'Zap', bodyPart: 'Upper Body' },
  { name: 'Biceps', slug: 'biceps', icon: 'Biceps', bodyPart: 'Arms' },
  { name: 'Triceps', slug: 'triceps', icon: 'Dumbbell', bodyPart: 'Arms' },
  { name: 'Forearms', slug: 'forearms', icon: 'Dumbbell', bodyPart: 'Arms' },
  { name: 'Legs', slug: 'legs', icon: 'Activity', bodyPart: 'Lower Body' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/meetfit');
    console.log('MongoDB connected for seeding...');

    await MuscleGroup.deleteMany({});
    console.log('Cleared existing muscle groups.');

    await MuscleGroup.insertMany(muscleGroups);
    console.log('Successfully seeded 6 Muscle Groups (removed Core & Glutes)!');

    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
