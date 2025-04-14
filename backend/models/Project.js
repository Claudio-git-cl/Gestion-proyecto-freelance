const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  hourlyRate: {
    type: Number,
    default: 0
  },
  fixedPrice: {
    type: Number,
    default: 0
  },
  billingType: {
    type: String,
    enum: ['hourly', 'fixed'],
    default: 'hourly'
  },
  notes: {
    type: String,
    trim: true
  },
  tasks: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    estimatedHours: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;