const mongoose = require('mongoose');

const storeschema = new mongoose.Schema({
  material: {
    type: String,
    required: true,
  },
  materialSpec: {
    type: String,
    required: true,
  },
  unitMeasure: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  totalCost:{
    type:Number,
   
  },
});

module.exports = mongoose.model('Store', storeschema);
