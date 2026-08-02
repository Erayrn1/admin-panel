const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true
    },
    category: {
      type: String,
      enum: ['general', 'support', 'sales', 'feedback', 'other'],
      default: 'general'
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
      minlength: [10, 'Message must be at least 10 characters long']
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'resolved'],
      default: 'pending'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    reply: {
      type: String,
      default: null
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    repliedAt: {
      type: Date,
      default: null
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number
    }],
    tags: [{
      type: String,
      trim: true
    }],
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true
  }
);

// Mark as read
contactSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return this;
};

// Add reply
contactSchema.methods.addReply = async function(reply, userId) {
  this.reply = reply;
  this.status = 'replied';
  this.repliedBy = userId;
  this.repliedAt = new Date();
  return this.save();
};

// Get status badge
contactSchema.methods.getStatusBadge = function() {
  const badges = {
    pending: 'warning',
    replied: 'info',
    resolved: 'success'
  };
  return badges[this.status] || 'secondary';
};

module.exports = mongoose.model('Contact', contactSchema);