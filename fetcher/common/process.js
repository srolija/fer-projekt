const fork = require('child_process').fork;
const path = require('path');

/**
 * Executes given node binary and returns results it returned via IPC.
 */
const exec = async (runtime) => {
  const program = path.resolve(runtime);
  const options = {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    // stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  };

  return new Promise((resolve) => {
    const child = fork(program, [], options);
    child.on('message', resolve);
  });
};

/**
 * Run the given script to fetch results for given date.
 * Only attempt specified number of times and in between attempt wait for given
 * wait-period. This way we are awaiting the results until they are published.
 */
const fetchResults = async (lottoId, runtime, date, attempts = 10, wait = 30) => {
  let error;

  for (let i = 0; i < attempts; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const msg = await exec(runtime);

    if (msg.status === 'SUCCESS') {
      const scheduledTime = date.getTime();
      const dataTime = new Date(msg.data.date).getTime();
      const scheduledDate = date.toISOString();
      const dataDate = msg.data.date;

      // If it matches, accept and return
      if (scheduledTime === dataTime) {
        return msg;
      }

      // If there is newer data, skip it and move on
      if (dataTime > scheduledTime) {
        return {
          status: 'ERROR',
          code: 'LOTTO_PASSED',
          log: `Lotto already passed, expected ${scheduledDate} and got ${dataDate}`,
        };
      }

      // If data is not yet available, try again
      error = {
        status: 'ERROR',
        code: 'LOTTO_NOT_AVAILABLE_YET',
        log: `Results not yet available ${scheduledDate} and got ${dataDate}!`,
      };
      console.log(`[${lottoId}] WAIT(${i}): Results not yet available ${scheduledDate} and got ${dataDate}!`);

      // eslint-disable-next-line no-await-in-loop
      await new Promise(res => setTimeout(res, wait * 1000));
    } else {
      // If there parsing error happened log it out and do try again, it might
      // just be an issue with parsing since it doesn't contain values.
      error = msg;
      console.log(`[${lottoId}] ERROR(${i}): [${msg.code}] ${msg.log}`);
    }
  }

  console.log(`[${lottoId}] BACKOFF: Gave up on ${runtime}:${date}`);
  return error;
};

module.exports = {
  fetchResults,
};
