'use strict';
const AWS = require('aws-sdk');
const textract = new AWS.Textract();

// this module will be provided by the layer
const chromeLambda = require('chrome-aws-lambda');
const puppeteer = chromeLambda.puppeteer;

const { NIT_SOLVENCY_URL } = process.env;

module.exports.GetNitSolvency = async (event, context, callback) => {
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
      //const assets = ['image', 'stylesheet', 'font'];
      const assets = [];
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

    console.log('Screenshoting...');
    const imgSelector = '#img';
    // await page.waitForSelector(imgSelector);
    // await page.waitFor(500);
    const clip = await page.$eval(imgSelector, (element) => {
      element.scrollIntoViewIfNeeded();
      const { height, width, x, y } = element.getBoundingClientRect();
      return { height, width, x, y };
    });

    // console.log(clip);
    const imgB64 = await page.screenshot({
      type: 'png',
      clip: clip,
      encoding: 'base64',
    });
    // console.log(imgB64);
    console.log('Screenshoting... OK');

    console.log('Extracting text...');
    const params = {
      Document: {
        Bytes: imgB64,
      },
    };

    const textractPromise = textract.detectDocumentText(params).promise();
    textractPromise
      .then((data) => {
        console.log('DATA', data);

        const response = {
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

        callback(null, response);
      })
      .catch((err) => {
        console.error(err, err.stack);
        const response = {
          statusCode: 500,
          body: JSON.stringify(
            {
              message: 'Something was wrong',
            },
            null,
            2
          ),
        };
        callback(null, response);
        return;
      });

    /*
    textract.detectDocumentText(params, async (error, data) => {
      if (error) {
        throw error;
      }

      console.log('DATA', data);
      console.log('Extracting text... OK');

      console.log('Typing NIT...');
      const nitSelector = '#nit';
      await page.type(nitSelector, nit);
      console.log('Typing NIT... OK');

      let solvency = 'Dummy';
      console.log('Solvency:', solvency);

      const response = {
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

      callback(null, response);
    });
    */
  } catch (e) {
    console.error(e, e.stack);
    const response = {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Something was wrong',
        },
        null,
        2
      ),
    };
    callback(null, response);
    return;
  }
};
