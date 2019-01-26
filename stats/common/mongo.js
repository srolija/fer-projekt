const mongoose = require('mongoose');

const initialize = async () => {
  await mongoose.connect('mongodb://localhost:27017/stats', { useNewUrlParser: true });
};

module.exports = {
  initialize,
};
