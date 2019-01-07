import getController, { EventType } from '@timberwolf/controller-lib';

const gameCode = document.getElementById('code') as HTMLInputElement;
const conenctButton = document.getElementById('connect') as HTMLButtonElement;

const upButton = document.getElementById('up') as HTMLButtonElement;
const downButton = document.getElementById('down') as HTMLButtonElement;
const leftButton = document.getElementById('left') as HTMLButtonElement;
const rightButton = document.getElementById('right') as HTMLButtonElement;
const submitButton = document.getElementById('submit') as HTMLButtonElement;
const cancelButton = document.getElementById('cancel') as HTMLButtonElement;

let up = false;
let down = false;
let left = false;
let right = false;

conenctButton.addEventListener('click', async () => {
  const code = gameCode.value;

  const controller = await getController(code);

  controller.addEventListener(EventType.Message, console.log);

  controller.addEventListener(EventType.Error, console.error);

  controller.addEventListener(EventType.Connected, () =>
    console.log('Controller connected')
  );

  controller.addEventListener(EventType.Disconnected, () =>
    console.log('Controller disconnected')
  );

  upButton.addEventListener('mousedown', () => {
    controller.send('up', 'true');
    up = true;
  });

  upButton.addEventListener('mouseleave', () => {
    if (up) {
      up = false;
      controller.send('up', 'false');
    }
  });

  upButton.addEventListener('mouseup', () => {
    if (up) {
      up = false;
      controller.send('up', 'false');
    }
  });

  downButton.addEventListener('mousedown', () => {
    controller.send('down', 'true');
    down = true;
  });
  downButton.addEventListener('mouseleave', () => {
    if (down) {
      down = false;
      controller.send('down', 'false');
    }
  });

  downButton.addEventListener('mouseup', () => {
    if (down) {
      down = false;
      controller.send('down', 'false');
    }
  });

  leftButton.addEventListener('mousedown', () => {
    controller.send('left', 'true');
    left = true;
  });

  leftButton.addEventListener('mouseleave', () => {
    if (left) {
      left = false;
      controller.send('left', 'false');
    }
  });

  leftButton.addEventListener('mouseup', () => {
    if (left) {
      left = false;
      controller.send('left', 'false');
    }
  });

  rightButton.addEventListener('mousedown', () => {
    controller.send('right', 'true');
    right = true;
  });

  rightButton.addEventListener('mouseleave', () => {
    if (right) {
      right = false;
      controller.send('right', 'false');
    }
  });

  rightButton.addEventListener('mouseup', () => {
    if (right) {
      right = false;
      controller.send('right', 'false');
    }
  });

  submitButton.addEventListener('click', () => {
    controller.send('submit', 'true');
  });

  cancelButton.addEventListener('click', () => {
    controller.send('cancel', 'true');
  });

  controller.connect();
});
