import { DynamoDB, AWSError } from 'aws-sdk';
import { Context } from 'aws-lambda';

const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

export async function handler(event: any, context: Context) {
  if (event.detail.lastStatus === 'STOPPED') {
    const taskARN = event.detail.taskArn;

    try {
      const scanResponse = await ddb
        .scan({
          TableName: 'SignallingServers',
          ExpressionAttributeValues: {
            ':v1': {
              S: taskARN,
            },
          },
          FilterExpression: 'ARN = :v1',
        })
        .promise();
      await ddb
        .deleteItem({
          TableName: 'SignallingServers',
          Key: {
            Code: {
              S: (scanResponse.Items as any[])[0].Code.S,
            },
          },
        })
        .promise();

      return context.succeed(true);
    } catch (error) {
      return context.fail(error);
    }
  }
}
