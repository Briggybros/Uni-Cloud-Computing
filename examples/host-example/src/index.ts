import { connect } from '@timberwolf/node-host-lib';

let count = 0;

console.log(`Game started with count=${count}`);

setTimeout(() => {
  const connection = connect('http://localhost:8081');

  connection.addEventListener('connectionestablished', () =>
    console.log('Controller connected')
  );
  connection.addEventListener('connectionterminated', () =>
    console.log('controller disconnected')
  );
  connection.addEventListener('error', console.error);
  connection.addEventListener('data', (controllerId: string, type: string) => {
    console.log(`Data received from ${controllerId} with type ${type}`);
    if (type === 'increment') {
      count = count + 1;
      console.log(`Count updated! count=${count}`);
    }
  });
}, 10000);
