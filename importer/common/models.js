const mongoose = require('mongoose');

const Lotto = mongoose.model('Lotto', {
  id: String,
  country: String,
  name: String,
  officialName: String,
  rules: {
    pickCount: Number,
    outOf: Number,
    jokerCount: Number,
  },
  stats: {
    limit: Number,
  },
  latestDrawDate: Date,
  assets: {
    officialPage: String,
    logo: String,
    colors: {
      numbers: String,
      numbersText: String,
      bonus: String,
      bonusText: String,
    },
  },
});

const Draw = mongoose.model('Draw', {
  lottoId: String,
  status: String,
  date: Date,

  // BLOCKED
  dateBlocked: Date,

  // PICKED
  dateParsed: Date,
  numbers: [Number],
  joker: [Number],
  extra: Object,
});

const Stat = mongoose.model('Draw', {
  lottoId: String,
  latestDrawDate: String,
  numbers: [{
    number: Number,
    picks: Number,
    outOf: Number,
    sinceLastPick: Number,
  }],
});

module.exports = {
  Lotto,
  Draw,
  Stat,
};
