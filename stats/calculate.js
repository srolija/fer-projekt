const { Draw } = require('./common/models');

const calculateStats = async (lottoId, date) => {
  // Get last 100 matches
  const previousMatches = await Draw.find({
    lottoId,
    date: { $lt: new Date(date) },
  }).sort('-date').limit(100).exec();

  const count = previousMatches.length;
  const numbers = {};
  let counter = 0;

  previousMatches.forEach((match) => {
    match.numbers.forEach((ball) => {
      if (!numbers[ball]) {
        numbers[ball] = {
          number: ball,
          picks: 0,
          outOf: count,
          sinceLastPick: counter,
        };
      }

      numbers[ball].picks += 1;
    });

    counter += 1;
  });

  return Object.values(numbers);
};

module.exports = {
  calculateStats,
};
