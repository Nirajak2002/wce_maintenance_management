const mongoose = require('mongoose');

const LabourOrderSchema = new mongoose.Schema({
  lType: {
    type: String,
    required: true,
  },
  lCharges: {
    type: Number,
    required: true,
  },
  lCount: {
    type: Number,
    required: true,
  },
  lAmount: {
    type: Number,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const LabourSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },  
  //Newly added by Swapnil-Aprupa
  labourOrder: {
    type: [LabourOrderSchema], 
  },
  
  sign: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('labour', LabourSchema);

