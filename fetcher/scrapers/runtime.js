const puppeteer = require('puppeteer');

/**
 * Starts new browser instance.
 */
const openBrowser = async () => puppeteer.launch();

/**
 * Open new page with specified url.
 */
const openPage = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);
  return page;
};


const sendData = (data) => {
  if (process.send) {
    process.send(data);
  } else {
    console.log(data);
  }
}

/**
 * Runtime for scraping function, encapsulates the main logic, error handling
 * and automatic timeout while scraping the endpoints.
 */
module.exports = async (args) => {
  // Validate that required arguments are provided
  if (!args.url) {
    console.error('URL is missing!');
    process.exit(-1);
  }

  if (!args.extractDate) {
    console.error('extractDate is missing!');
    process.exit(-1);
  }

  if (!args.extractPicks) {
    console.error('extractPicks is missing!');
    process.exit(-1);
  }

  // Optional defaults for timeout
  const timeout = args.timeout || 10000;

  // Set the timeout to ensure that process finishes in reasonable time
  setTimeout(() => {
    sendData({
      status: 'ERROR',
      code: 'TIMEOUT',
    });
    process.exit(1);
  }, timeout);


  // Create Chromium browser instance
  let browser;
  try {
    browser = await openBrowser();
  } catch (err) {
    sendData({
      status: 'ERROR',
      code: 'BROWSER_UNAVAILABLE',
      log: err.message,
    });
    process.exit(-1);
  }
  console.log('Started browser');


  // Open the given URL
  let page;
  try {
    page = await openPage(browser, args.url);
  } catch (err) {
    sendData({
      status: 'ERROR',
      code: 'PAGE_UNAVAILABLE',
      log: err.message,
    });
    process.exit(-1);
  }
  console.log('Loaded page');


  // If there are, run the prerequisite tasks
  if (args.before) {
    console.log('Starting before');
    try {
      await args.before(page);
    } catch (err) {
      sendData({
        status: 'ERROR',
        code: 'PAGE_UNAVAILABLE',
        log: err.message,
      });
      process.exit(-1);
    }
    console.log('Done before');
  }


  // Extract last pick date from page
  let date;
  try {
    date = await args.extractDate(page);
  } catch (err) {
    sendData({
      status: 'ERROR',
      code: 'DATE_PARSING',
      log: err.message,
    });
    process.exit(-1);
  }
  console.log('Extracted date: ', date);


  // Extract picks and joker if there is
  let picks = null;
  let joker = null;

  try {
    [picks, joker] = await args.extractPicks(page);
  } catch (err) {
    sendData({
      status: 'ERROR',
      code: 'PICKS_PARSING',
      log: err.message,
    });
    process.exit(-1);
  }
  console.log('Extracted picks: ', picks, joker);


  // Optional default for extra
  const extractExtra = args.extractExtra || (() => undefined);

  // Extract additional data
  let extra;
  try {
    extra = await extractExtra(page);
  } catch (err) {
    sendData({
      status: 'ERROR',
      code: 'EXTRA_PARSING',
      log: err.message,
    });
    process.exit(-1);
  }
  console.log('Extracted extras: ', extra);


  // Aggregate the data and send it to parent process
  sendData({
    status: 'SUCCESS',
    data: {
      date,
      picks,
      joker,
      extra,
    },
  });


  // Close browser
  await browser.close();

  // Kill process with success before timeout triggers
  process.exit(0);
};
