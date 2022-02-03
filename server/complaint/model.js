const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  compId:{
    type: String,
    required: true,

  },

  department: {
    type: String,
    required: true,
  },
  details: {     //2022cse001 2022mech00002
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  workType: {
    type: String,
    required: true,
  },
  sourceOfFund: {
    type: String,
  },
  otherWork: {
    type: String,
  },
  reasonForRejection: {
    type: String,
  },
  rejected: {
    type: Boolean,
    default: false,
  },
  signOfStudentOrStaff: {
    type: String,
    required: true,
  },
  fund: {
    type: Number,
  },
  HoDSign: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    default: 'Forwarded to HoD',
  },
  stage: {
    type: Number,
    default: 1, // 1->Complaint is at student/staff and corresponding HoD 2-> at AO 3-> at admin
  }, // 4- at committee 5 - at director 6 -at store  7- work in progress ( at admin/ committee)  8 - work done( at admin/ committee) 9 - acknowledgement at user
  grantAccessTo: [
    {
      Civil: {
        isGranted: { type: Boolean, default: false },
        isSubmitted: { type: Boolean, default: false },
      },
      Mechanical: {
        isGranted: { type: Boolean, default: false },
        isSubmitted: { type: Boolean, default: false },
      },
      Electrical: {
        isGranted: { type: Boolean, default: false },
        isSubmitted: { type: Boolean, default: false },
      },
      director: {
        isGranted: { type: Boolean, default: false },
        isSubmitted: { type: Boolean, default: false },
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  actualMaterialCost:{
    type:Number,
    default:0,
  }
});
module.exports = mongoose.model('Complaint', ComplaintSchema);