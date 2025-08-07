const mongoose = require('mongoose');

const articuloSchema = new mongoose.Schema({
  modelo: { type: String, required: true },
  bcv: { type: Number, required: true },
  dolarBcv: { type: Number, required: true },
  inicial: { type: Number, required: true },
  cuotas: { type: Number, required: true },
  balance: { type: Number, required: true },
  bin: { type: Number, required: true },
  weppa: { type: Number, required: true }
});

module.exports = mongoose.model('Articulo', articuloSchema);