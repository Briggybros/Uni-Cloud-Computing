import getController, { EventType } from '@timberwolf/controller-lib';

const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const submitButton = document.getElementById('submit');
const cancelButton = document.getElementById('cancel');

let up = false;
let down = false;
let left = false;
let right = false;

getController('http://localhost:8081').then(controller => {
  controller.addEventListener(EventType.Message, console.log);

  controller.addEventListener(EventType.Error, console.error);

  controller.addEventListener(EventType.Connected, () =>
    console.log('Controller connected')
  );

  controller.addEventListener(EventType.Disconnected, () =>
    console.log('Controller disconnected')
  );

  upButton &&
    upButton.addEventListener('mousedown', () => {
      controller.send('up', 'true');
      up = true;
    });

  upButton &&
    upButton.addEventListener('mouseleave', () => {
      if (up) {
        up = false;
        controller.send('up', 'false');
      }
    });

  upButton &&
    upButton.addEventListener('mouseup', () => {
      if (up) {
        up = false;
        controller.send('up', 'false');
      }
    });

  downButton &&
    downButton.addEventListener('mousedown', () => {
      controller.send('down', 'true');
      down = true;
    });
  downButton &&
    downButton.addEventListener('mouseleave', () => {
      if (down) {
        down = false;
        controller.send('down', 'false');
      }
    });

  downButton &&
    downButton.addEventListener('mouseup', () => {
      if (down) {
        down = false;
        controller.send('down', 'false');
      }
    });

  leftButton &&
    leftButton.addEventListener('mousedown', () => {
      controller.send('left', 'true');
      left = true;
    });

  leftButton &&
    leftButton.addEventListener('mouseleave', () => {
      if (left) {
        left = false;
        controller.send('left', 'false');
      }
    });

  leftButton &&
    leftButton.addEventListener('mouseup', () => {
      if (left) {
        left = false;
        controller.send('left', 'false');
      }
    });

  rightButton &&
    rightButton.addEventListener('mousedown', () => {
      controller.send('right', 'true');
      right = true;
    });

  rightButton &&
    rightButton.addEventListener('mouseleave', () => {
      if (right) {
        right = false;
        controller.send('right', 'false');
      }
    });

  rightButton &&
    rightButton.addEventListener('mouseup', () => {
      if (right) {
        right = false;
        controller.send('right', 'false');
      }
    });

  submitButton &&
    submitButton.addEventListener('click', () => {
      controller.send('submit', 'true');
    });

  cancelButton &&
    cancelButton.addEventListener('click', () => {
      controller.send('cancel', 'true');
    });

  controller.connect();
});
