'use strict';

module.exports.GetNitSolvency = async (event) => {
  console.log('event:', event);

  const { nit } = event.pathParameters;
  console.log('NIT:', nit);

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

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
