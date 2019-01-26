const mongoose = require('mongoose');

const Draw = mongoose.model('Draw', {
  lottoId: String,
  date: Date,
  numbers: [Number],
});

module.exports = {
  Draw,
};
