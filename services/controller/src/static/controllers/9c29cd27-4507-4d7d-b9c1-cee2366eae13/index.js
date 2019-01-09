controller => {
  const upButton = document.getElementById('up');
  const downButton = document.getElementById('down');
  const leftButton = document.getElementById('left');
  const rightButton = document.getElementById('right');
  const aButton = document.getElementById('a-button');
  const bButton = document.getElementById('b-button');

  let up = false;
  let down = false;
  let left = false;
  let right = false;

  controller.addEventListener('Message', console.log);

  controller.addEventListener('Error', console.error);

  controller.addEventListener('Connected', () =>
    console.log('Controller connected')
  );

  controller.addEventListener('Disconnected', () =>
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

  aButton.addEventListener('mousedown', () => {
    controller.send('a', 'true');
    right = true;
  });
  aButton.addEventListener('mouseleave', () => {
    if (right) {
      right = false;
      controller.send('a', 'false');
    }
  });
  aButton.addEventListener('mouseup', () => {
    if (right) {
      right = false;
      controller.send('a', 'false');
    }
  });

  bButton.addEventListener('mousedown', () => {
    controller.send('b', 'true');
    right = true;
  });
  bButton.addEventListener('mouseleave', () => {
    if (right) {
      right = false;
      controller.send('b', 'false');
    }
  });
  bButton.addEventListener('mouseup', () => {
    if (right) {
      right = false;
      controller.send('b', 'false');
    }
  });

  controller.connect();
};
