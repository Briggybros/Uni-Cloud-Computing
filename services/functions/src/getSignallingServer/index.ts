import { DynamoDB, AWSError } from 'aws-sdk';
import { Context } from 'aws-lambda';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

export async function handler(
  event: any,
  context: Context,
  callback: Function
) {
  const code = event.pathParameters.code;

  try {
    const getResponse = await ddb
      .getItem({
        TableName: 'SignallingServers',
        Key: {
          Code: {
            S: code,
          },
        },
      })
      .promise();

    if (!getResponse.Item) {
      return callback(null, {
        statusCode: 404,
        headers: {},
        body: 'Not found',
        isBase64Encoded: false,
      });
    }

    return callback(null, {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({
        code: getResponse.Item.Code.S,
        ip: getResponse.Item.IP.S,
      }),
      isBase64Encoded: false,
    });
  } catch (error) {
    return callback(error);
  }
}
