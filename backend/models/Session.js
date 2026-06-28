const mongoose = require('mongoose');

const setSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    reps: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
  },
  { _id: true }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    sets: [setSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
