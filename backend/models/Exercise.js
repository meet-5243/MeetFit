const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    muscleGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MuscleGroup',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
