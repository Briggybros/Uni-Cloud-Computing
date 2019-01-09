controller => {
  const upButton = document.getElementById('up');
  const downButton = document.getElementById('down');
  const leftButton = document.getElementById('left');
  const rightButton = document.getElementById('right');
  const aButton = document.getElementById('a-button');
  const bButton = document.getElementById('b-button');

  buttonStates = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
  };

  controller.addEventListener('Message', console.log);

  controller.addEventListener('Error', console.error);

  controller.addEventListener('Connected', () =>
    console.log('Controller connected')
  );

  controller.addEventListener('Disconnected', () =>
    console.log('Controller disconnected')
  );

  function buttonDown(name) {
    if (!buttonStates[name]) {
      buttonStates[name] = true;
      controller.send(name, 'true');
    }
  }

  function buttonUp(name) {
    if (buttonStates[name]) {
      buttonStates[name] = false;
      controller.send(name, 'false');
    }
  }

  function addListeners(element, name) {
    element.addEventListener('mousedown', () => buttonDown(name));
    element.addEventListener('mouseleave', () => buttonUp(name));
    element.addEventListener('mouseup', () => buttonUp(name));
    element.addEventListener('touchstart', e => buttonDown(name));
    element.addEventListener('touchend', () => buttonUp(name));
  }

  addListeners(upButton, 'up');
  addListeners(downButton, 'down');
  addListeners(leftButton, 'left');
  addListeners(rightButton, 'right');
  addListeners(aButton, 'a');
  addListeners(bButton, 'b');

  controller.connect();
};
