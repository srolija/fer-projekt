const CronJob = require('cron').CronJob;

/**
 * Calls the provided function, providing the schedule date.
 */
const wrapWithDate = (run, offsetMinutes) => {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  run(date);
};

/**
 * Schedule given job at specified schedule in given timezone and called with
 * the specified date offset.
 */
const schedule = (jobSchedule, job, offsetMinutes, tz) => {
  if (!jobSchedule) {
    throw new Error(`Invalid job schedule: ${jobSchedule}`);
  }

  jobSchedule.forEach((rule) => {
    const tick = () => {
      wrapWithDate(job, offsetMinutes);
    };
    // eslint-disable-next-line no-new
    new CronJob(rule, tick, null, true, tz);
  });
};

module.exports = {
  schedule,
};
