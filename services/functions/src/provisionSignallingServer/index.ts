import { ECS, EC2, DynamoDB, ApiGatewayManagementApi, AWSError } from 'aws-sdk';

const CLUSTER = 'Timberwolf-Signalling';
const TASK_DEFINITION = 'SignallingServer:4';

const ecs = new ECS({ apiVersion: '2014-11-13' });
const ec2 = new EC2({ apiVersion: '2016-11-15' });
const ddb = new DynamoDB({ apiVersion: '2012-08-10' });

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

  const agma = new ApiGatewayManagementApi({
    endpoint,
    apiVersion: '2018-11-29',
  });

  async function doError(error: any) {
    console.error(error);
    await agma
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          code: 500,
          message: 'Internal Server Error',
          body: error,
        }),
      })
      .promise();
    process.exit(1);
  }

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
      overrides: {
        containerOverrides: [
          {
            name: 'SignallingServer',
            environment: [{ name: 'HOST_KEY', value: hostKey }],
          },
        ],
      },
    })
    .promise()
    .then(result => result.$response);

  if (runTaskResponse.error) return await doError(runTaskResponse.error);

  if (
    !runTaskResponse.data ||
    !runTaskResponse.data.tasks ||
    !runTaskResponse.data.tasks[0]
  ) {
    return await doError('No tasks running');
  }

  const taskARN = runTaskResponse.data.tasks[0].taskArn as string;

  const waitForResponse = await ecs
    .waitFor('tasksRunning', { cluster: CLUSTER, tasks: [taskARN] })
    .promise()
    .then(result => result.$response);

  if (waitForResponse.error) return await doError(waitForResponse.error);

  if (
    !waitForResponse.data ||
    !waitForResponse.data.tasks ||
    !waitForResponse.data.tasks[0]
  ) {
    return await doError('No tasks');
  }

  if (!waitForResponse.data.tasks[0].attachments) {
    return await doError('No network interface');
  }

  const netInterfaceAttachment = waitForResponse.data.tasks[0].attachments.filter(
    attachment => attachment.type === 'ElasticNetworkInterface'
  )[0];

  if (!netInterfaceAttachment || !netInterfaceAttachment.details) {
    return await doError('No network interface');
  }

  const networkInterfaceId = netInterfaceAttachment.details
    .filter(detail => detail.name === 'networkInterfaceId')
    .map(detail => detail.value)[0];

  if (!networkInterfaceId) {
    return await doError('No network interface id');
  }

  const describeNetworkInterfacesResponse = await ec2
    .describeNetworkInterfaces({
      NetworkInterfaceIds: [networkInterfaceId],
    })
    .promise()
    .then(result => result.$response);

  if (describeNetworkInterfacesResponse.error) {
    return await doError(describeNetworkInterfacesResponse.error);
  }

  if (
    !describeNetworkInterfacesResponse.data ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
  ) {
    return await doError('No network interfaces');
  }

  if (
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses ||
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses[0]
  ) {
    return await doError('No assigned IP addresses');
  }

  if (
    !describeNetworkInterfacesResponse.data.NetworkInterfaces[0]
      .PrivateIpAddresses[0].Association
  ) {
    return await doError('No associated public IP address');
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
    return await doError(putItemResponse.error);
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
