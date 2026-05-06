const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema({
  depotId: { type: String, required: true },
  mechanicHours: { type: Number, required: true }
});

module.exports = mongoose.model('Depot', depotSchema);
