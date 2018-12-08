import { connect } from '@timberwolf/controller-lib';

const connectButton = document.getElementById('connect');
const incrementButton = document.getElementById('increment');

connectButton &&
  connectButton.addEventListener('click', () => {
    console.log('Connect button clicked');
    const host = connect('http://localhost:8081');

    host.addEventListener('data', console.log);
    host.addEventListener('error', console.error);
    host.addEventListener('connectionestablished', () => {
      connectButton.setAttribute('disabled', 'true');
      incrementButton && incrementButton.removeAttribute('disabled');
    });
    host.addEventListener('connectionterminated', () => {
      connectButton.removeAttribute('disabled');
      incrementButton && incrementButton.setAttribute('disabled', 'true');
    });

    incrementButton &&
      incrementButton.addEventListener('click', () => {
        console.log('Increment button clicked');
        host.send('increment');
      });
  });
