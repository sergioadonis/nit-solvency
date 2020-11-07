'use strict';
// this module will be provided by the layer
const chromeLambda = require('chrome-aws-lambda');
const puppeteer = chromeLambda.puppeteer;

const { NIT_SOLVENCY_URL } = process.env;

module.exports.GetNitSolvency = async (event) => {
  try {
    console.log('NIT_SOLVENCY_URL:', NIT_SOLVENCY_URL);
    const { nit } = event.pathParameters;
    console.log('NIT:', nit);

    // launch a headless browser
    const defaultViewport = { width: 1440, height: 1080 };
    const browser = await puppeteer.launch({
      args: chromeLambda.args,
      executablePath: await chromeLambda.executablePath,
      defaultViewport: defaultViewport,
    });
    const page = await browser.newPage();

    // Intercepting images, stylesheets and fonts
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const assets = ['image', 'stylesheet', 'font'];
      // const assets = [];
      if (assets.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Configure the navigation timeout
    page.setDefaultNavigationTimeout(0);

    // Navigating to url
    console.log('Opening NIT_SOLVENCY_URL...');
    await page.goto(NIT_SOLVENCY_URL);
    console.log('Opening NIT_SOLVENCY_URL... OK');

    let solvency = 'Dummy';
    console.log('Solvency:', solvency);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Ok',
          nit: nit,
          solvency: solvency,
        },
        null,
        2
      ),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Something was wrong',
        },
        null,
        2
      ),
    };
  }
};
