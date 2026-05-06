const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Event', 'Result', 'Placement'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  studentId: { type: String, required: true }
}, { timestamps: true });

// Stage 3: Optimize query
// SELECT * FROM notifications WHERE studentID = X AND isRead = false ORDER BY createdAt DESC;
notificationSchema.index({ studentId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
