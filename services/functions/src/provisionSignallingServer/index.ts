import { ECS, EC2, DynamoDB, ApiGatewayManagementApi, AWSError } from 'aws-sdk';

const CLUSTER = 'Timberwolf-Signalling';
const TASK_DEFINITION = 'SignallingServer:4';

function logErrorAndClose(error: any) {
  console.error(error);
  process.exit(1);
}

function generateChars(i: number = 1) {
  function generateChar() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  let sb: string = '';
  for (let c = 0; c < i; c += 1) {
    sb += generateChar();
  }
  return sb;
}

export async function handler(event: any) {
  const { endpoint, connectionId } = event;

  const code = generateChars(4);
  const hostKey = generateChars(16);

  const ecs = new ECS({ apiVersion: '2014-11-13' });
  const ec2 = new EC2({ apiVersion: '2016-11-15' });
  const ddb = new DynamoDB({ apiVersion: '2012-08-10' });
  const agma = new ApiGatewayManagementApi({
    endpoint,
    apiVersion: '2018-11-29',
  });

  const runTaskResponse = await ecs
    .runTask({
      cluster: CLUSTER,
      taskDefinition: TASK_DEFINITION,
      launchType: 'FARGATE',
      count: 1,
      platformVersion: 'LATEST',
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          securityGroups: ['sg-074a70481c843d705'],
          subnets: ['subnet-3475bc78', 'subnet-3475bc78', 'subnet-3475bc78'],
        },
      },
    })
    .promise()
    .then(result => result.$response);

  if (runTaskResponse.error) return logErrorAndClose(runTaskResponse.error);

  if (
    !runTaskResponse.data ||
    !runTaskResponse.data.tasks ||
    !runTaskResponse.data.tasks[0]
  ) {
    return logErrorAndClose('No tasks running');
  }

  const taskARN = runTaskResponse.data.tasks[0].taskArn as string;

  const waitForResponse = await ecs
    .waitFor('tasksRunning', { cluster: CLUSTER, tasks: [taskARN] })
    .promise()
    .then(result => result.$response);

  if (waitForResponse.error) return logErrorAndClose(waitForResponse.error);

  if (
    !waitForResponse.data ||
    !waitForResponse.data.tasks ||
    !waitForResponse.data.tasks[0]
  ) {
    return logErrorAndClose('No tasks');
  }

  if (!waitForResponse.data.tasks[0].attachments) {
    return logErrorAndClose('No network interface');
  }

  const netInterfaceAttachment = waitForResponse.data.tasks[0].attachments.filter(
    attachment => attachment.type === 'ElasticNetworkInterface'
  )[0];

  if (!netInterfaceAttachment || !netInterfaceAttachment.details) {
    return logErrorAndClose('No network interface');
  }

  const networkInterfaceId = netInterfaceAttachment.details
    .filter(detail => detail.name === 'networkInterfaceId')
    .map(detail => detail.value)[0];

  if (!networkInterfaceId) {
    return logErrorAndClose('No network interface id');
  }

  const describeNetworkInterfacesResponse = await ec2
    .describeNetworkInterfaces({
      NetworkInterfaceIds: [networkInterfaceId],
    })
    .promise()
    .then(result => result.$response);

  if (describeNetworkInterfacesResponse.error) {
    return logErrorAndClose(describeNetworkInterfacesResponse.error);
  }

  if (
    !describeNetworkInterfacesResponse.data ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
  ) {
    return logErrorAndClose('No network interfaces');
  }

  if (
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses[0]
  ) {
    return logErrorAndClose('No assigned IP addresses');
  }

  if (
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses[0].Association
  ) {
    return logErrorAndClose('No associated public IP address');
  }

  const ip =
    describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses[0].Association.PublicIp;

  const putItemResponse = await ddb
    .putItem({
      TableName: 'SignallingServers',
      Item: {
        Code: {
          S: code,
        },
        ARN: {
          S: taskARN,
        },
        IP: {
          S: ip,
        },
      },
    })
    .promise()
    .then(result => result.$response);

  if (putItemResponse.error) {
    return logErrorAndClose(putItemResponse.error);
  }

  await agma
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({
        code: 201,
        message: 'Created',
        body: {
          code,
          hostKey,
          ip,
        },
      }),
    })
    .promise();

  return;
}
