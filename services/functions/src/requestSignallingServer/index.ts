import { Lambda, ApiGatewayManagementApi } from 'aws-sdk';

const lambda = new Lambda({ apiVersion: '2015-03-31' });

export async function handler(event: any) {
  const endpoint = `${event.requestContext.domainName}/${
    event.requestContext.stage
  }`;
  const connectionId = event.requestContext.connectionId;

  const agma = new ApiGatewayManagementApi({
    endpoint,
    apiVersion: '2018-11-29',
  });

  await lambda
    .invoke({
      FunctionName:
        'arn:aws:lambda:us-east-2:573399366614:function:provisionSignallingServer',
      InvocationType: 'Event',
      Payload: JSON.stringify({
        endpoint,
        connectionId,
      }),
    })
    .promise();

  await agma
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({
        code: 102,
        message: 'Processing',
      }),
    })
    .promise();

  return { statusCode: 102, message: 'Processing', body: {} };
}
