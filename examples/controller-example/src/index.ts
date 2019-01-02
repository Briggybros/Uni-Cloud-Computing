import getController, {
  CommsType,
  EventType,
} from '@timberwolf/controller-lib';

const connectButton = document.getElementById('connect');
const incrementButton = document.getElementById('increment');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const submitButton = document.getElementById('submit');
const cancelButton = document.getElementById('cancel');

connectButton &&
  connectButton.addEventListener('click', async () => {
    console.log('Connect button clicked');
    const controller = await getController('http://localhost:8081');

    controller.addEventListener(EventType.Message, console.log);
    controller.addEventListener(EventType.Error, console.error);
    controller.addEventListener(EventType.Connected, () => {
      connectButton.setAttribute('disabled', 'true');
      incrementButton && incrementButton.removeAttribute('disabled');
    });
    controller.addEventListener(EventType.Disconnected, () => {
      connectButton.removeAttribute('disabled');
      incrementButton && incrementButton.setAttribute('disabled', 'true');
    });
    incrementButton &&
      incrementButton.addEventListener('click', () => {
        controller.send('increment');
      });
    upButton &&
      upButton.addEventListener('mousedown', () => {
        controller.send('up', 'true');
      });
      upButton.addEventListener('mouseup', () => {
        controller.send('up', 'false');
      });
    downButton &&
      downButton.addEventListener('mousedown', () => {
        controller.send('down', 'true');
      });
      downButton.addEventListener('mousedown', () => {
        controller.send('down', 'false');
      });
    leftButton &&
      leftButton.addEventListener('mousedown', () => {
        controller.send('left', 'true');
      });
      leftButton.addEventListener('mouseleft', () => {
        controller.send('left', 'false');
      });
    rightButton &&
      rightButton.addEventListener('mousedown', () => {
        controller.send('right', 'true');
      });
      rightButton.addEventListener('mouseright', () => {
        controller.send('right', 'false');
      });
    submitButton &&
      submitButton.addEventListener('mousedown', () => {
        controller.send('submit', 'true');
      });
      submitButton.addEventListener('mousesubmit', () => {
        controller.send('submit', 'false');
      });
    cancelButton &&
      cancelButton.addEventListener('mousedown', () => {
        controller.send('cancel', 'true');
      });
      cancelButton.addEventListener('mousecancel', () => {
        controller.send('cancel', 'false');
      });

    controller.connect();
  });
