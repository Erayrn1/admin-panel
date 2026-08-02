const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: 'Admin Panel'
    },
    siteDescription: {
      type: String,
      default: 'A comprehensive admin panel for managing your application'
    },
    siteUrl: {
      type: String,
      default: 'http://localhost:3000'
    },
    contactEmail: {
      type: String,
      default: 'admin@example.com'
    },
    phoneNumber: {
      type: String,
      default: '+1 (555) 123-4567'
    },
    address: {
      type: String,
      default: '123 Main St, City, State 12345'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently under maintenance. Please try again later.'
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    emailVerificationRequired: {
      type: Boolean,
      default: false
    },
    twoFactorRequired: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 120 // minutes
    },
    passwordMinLength: {
      type: Number,
      default: 6
    },
    passwordExpiryDays: {
      type: Number,
      default: 0 // 0 means no expiry
    },
    paginationLimit: {
      type: Number,
      default: 10
    },
    filesUploadLimit: {
      type: Number,
      default: 10 // MB
    },
    allowedFileTypes: [{
      type: String,
      default: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
    }],
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    },
    smtpSettings: {
      host: String,
      port: Number,
      username: String,
      password: String,
      fromEmail: String,
      fromName: String
    },
    logoUrl: {
      type: String,
      default: null
    },
    faviconUrl: {
      type: String,
      default: null
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    secondaryColor: {
      type: String,
      default: '#6c757d'
    },
    googleAnalyticsId: String,
    enableNotifications: {
      type: Boolean,
      default: true
    },
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    backupEnabled: {
      type: Boolean,
      default: false
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    lastBackupDate: Date,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  const count = await mongoose.model('Settings').countDocuments();
  if (count > 0) {
    throw new Error('Only one settings document is allowed');
  }
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);