import { DynamoDB, AWSError } from 'aws-sdk';
import { Context } from 'aws-lambda';

export function handler(event: any, context: Context) {
  if (event.detail.lastStatus === 'STOPPED') {
    const taskARN = event.detail.taskArn;
    const ddb = new DynamoDB();

    ddb.scan(
      {
        TableName: 'SignallingServers',
        ExpressionAttributeValues: {
          ':v1': {
            S: taskARN,
          },
        },
        FilterExpression: 'ARN = :v1',
      },
      (err: AWSError, data: DynamoDB.QueryOutput) => {
        if (err) return context.fail(err);

        ddb.deleteItem(
          {
            TableName: 'SignallingServers',
            Key: {
              Code: {
                S: (data.Items as any[])[0].Code.S,
              },
            },
          },
          (err: AWSError) => {
            if (err) return context.fail(err);
            return context.succeed(true);
          }
        );
      }
    );
  }
}
