const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  modelo: { type: String, required: true },
  compra: { type: Number, required: true },
  inicial: { type: Number, required: true },
  balance: { type: Number, required: true },
  pago: { type: Number, required: true },
  cuota: { type: Number, required: true },
  weppa: { type: Number, required: true },
  bin: { type: Number, required: true },
  bcv: { type: Number, required: true }
});

module.exports = mongoose.model('Cliente', clienteSchema);