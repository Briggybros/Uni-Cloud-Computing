import { ECS, DynamoDB, AWSError, EC2 } from 'aws-sdk';
import { APIGatewayEvent, Context } from 'aws-lambda';

const CLUSTER = 'Timberwolf-Signalling';
const TASK_DEFINITION = 'SignallingServer:4';

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

export function handler(event: APIGatewayEvent, context: Context) {
  const code = generateChars(4);
  const hostKey = generateChars(16);

  const ecs = new ECS();
  const ec2 = new EC2();
  const ddb = new DynamoDB();

  ecs.runTask(
    {
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
    },
    (err, data) => {
      if (err) return context.fail(err);

      if (!data.tasks) return context.fail('No tasks running');

      const taskARNs = data.tasks
        .map(task => task.taskArn)
        .filter(arn => arn !== undefined) as string[];

      ecs.waitFor(
        'tasksRunning',
        {
          cluster: 'Timberwolf-Signalling',
          tasks: taskARNs,
        },
        (err: AWSError, data: ECS.DescribeTasksResponse) => {
          if (err) return context.fail(err);

          if (!data.tasks || !data.tasks[0]) {
            return context.fail('No tasks');
          }
          if (!data.tasks[0].attachments) {
            return context.fail('No network interface');
          }

          const taskArn = data.tasks[0].taskArn as string;

          const netInterfaceAttachment = data.tasks[0].attachments.filter(
            attachment => attachment.type === 'ElasticNetworkInterface'
          )[0];

          if (!netInterfaceAttachment || !netInterfaceAttachment.details) {
            return context.fail('No network interface');
          }

          const networkInterfaceId = netInterfaceAttachment.details
            .filter(detail => detail.name === 'networkInterfaceId')
            .map(detail => detail.value)[0];

          if (!networkInterfaceId) {
            return context.fail('No network interface id');
          }

          ec2.describeNetworkInterfaces(
            {
              NetworkInterfaceIds: [networkInterfaceId],
            },
            (err: AWSError, data: EC2.DescribeNetworkInterfacesResult) => {
              if (err) return context.fail(err);

              if (!data.NetworkInterfaces || !data.NetworkInterfaces[0]) {
                return context.fail('No network interfaces');
              }

              if (
                !data.NetworkInterfaces[0].PrivateIpAddresses ||
                !data.NetworkInterfaces[0].PrivateIpAddresses[0]
              ) {
                return context.fail('No assigned IP addresses');
              }

              if (
                !data.NetworkInterfaces[0].PrivateIpAddresses[0].Association
              ) {
                return context.fail('No associated public IP address');
              }

              const ip =
                data.NetworkInterfaces[0].PrivateIpAddresses[0].Association
                  .PublicIp;

              ddb.putItem(
                {
                  TableName: 'SignallingServers',
                  Item: {
                    Code: {
                      S: code,
                    },
                    ARN: {
                      S: taskArn,
                    },
                    IP: {
                      S: ip,
                    },
                  },
                },
                (err: AWSError) => {
                  if (err) return context.fail(err);
                  return context.succeed({
                    code,
                    hostKey,
                    ip,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
}
