const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success', 'debug'],
      default: 'info'
    },
    action: {
      type: String,
      required: [true, 'Please provide an action']
    },
    description: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    username: String,
    ipAddress: String,
    userAgent: String,
    statusCode: Number,
    endpoint: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    duration: Number, // milliseconds
    resultDetails: {
      status: String,
      message: String,
      affectedRecords: Number
    }
  },
  {
    timestamps: true
  }
);

// Create index for faster queries
logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ action: 1, createdAt: -1 });

// Get log level color
logSchema.methods.getLevelColor = function() {
  const colors = {
    info: 'blue',
    warning: 'yellow',
    error: 'red',
    success: 'green',
    debug: 'gray'
  };
  return colors[this.type] || 'gray';
};

// Format log for display
logSchema.methods.format = function() {
  return {
    timestamp: this.createdAt.toLocaleString(),
    type: this.type,
    action: this.action,
    description: this.description,
    user: this.username || 'System',
    ipAddress: this.ipAddress,
    details: this.resultDetails
  };
};

module.exports = mongoose.model('Log', logSchema);