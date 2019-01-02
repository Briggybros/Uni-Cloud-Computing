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
var up = false;
var down = false;
var left = false;
var right = false;

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
		up = true;
      });
	upButton &&
	  upButton.addEventListener('mouseleave', () => {
		if(up){
			up = false;
			controller.send('up', 'false');
		}
	  });
	upButton &&
      upButton.addEventListener('mouseup', () => {
		if(up){
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
		if(down){
			down = false;
			controller.send('down', 'false');
		}
	  });
	downButton &&
      downButton.addEventListener('mouseup', () => {
        if(down){
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
		if(left){
			left = false;
			controller.send('left', 'false');
		}
	  });
	leftButton &&
      leftButton.addEventListener('mouseup', () => {
        if(left){
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
		if(right){
			right = false;
			controller.send('right', 'false');
		}
	  });
	rightButton &&
      rightButton.addEventListener('mouseup', () => {
        if(right){
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
