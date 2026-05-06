const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  duration: { type: Number, required: true },
  impact: { type: Number, required: true }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
