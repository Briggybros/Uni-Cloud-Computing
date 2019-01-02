import { ECS, AWSError } from 'aws-sdk';
import { APIGatewayEvent, Context } from 'aws-lambda';

function generateCode() {
  function generateChar() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }

  return `${generateChar()}${generateChar()}${generateChar()}${generateChar()}`;
}

export function handler(event: APIGatewayEvent, context: Context) {
  const ecs = new ECS();
  ecs.runTask(
    {
      cluster: 'Signalling',
      taskDefinition: 'SignallingServer:4',
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: 'ENABLED',
          subnets: ['subnet-03e8e7dbe0440fd6b', 'subnet-07aef6cc82eed6fb4'],
        },
      },
      // tags: [
      //   {
      //     key: 'code',
      //     value: generateCode(),
      //   },
      // ],
    },
    (error: AWSError, response: ECS.RunTaskResponse) => {
      if (error) return context.fail(error);
      return context.succeed(response);
    }
  );
}
