const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  component: { type: String, required: true, unique: true },
  data: { type: Map, of: String } // Flexible key-value structure
});

module.exports = mongoose.model('Content', ContentSchema);
