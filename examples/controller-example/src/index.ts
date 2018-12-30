import getController, {
  CommsType,
  EventType,
} from '@timberwolf/controller-lib';

const connectButton = document.getElementById('connect');
const incrementButton = document.getElementById('increment');

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

    controller.connect();
  });
