import * as React from 'react';

import Controller, { CommsType, EventType } from './Controller';
import PeerController from './PeerController';
import RelayController from './RelayController';
import { RouteComponentProps } from 'react-router';

async function getController(code: string): Promise<Controller> {
  const fetchIpResponse = await fetch(
    `https://cohqlf6j49.execute-api.us-east-2.amazonaws.com/prod/${code}`,
    {
      method: 'GET',
      mode: 'cors',
    }
  );
  if (!fetchIpResponse.ok) {
    throw new Error('Bad room code');
  }

  const { ip } = await fetchIpResponse.json();

  const url = `http://${ip}`;
  const fetchModeResponse = await fetch(url);
  const { mode } = await fetchModeResponse.json(); // Get controller ID here in future
  const controllerId = '9c29cd27-4507-4d7d-b9c1-cee2366eae13';

  const commsType: CommsType =
    mode === 'peer' ? CommsType.Peer : CommsType.Relay;

  switch (commsType) {
    case CommsType.Peer:
      return new PeerController(url, controllerId);
    case CommsType.Relay:
      return new RelayController(url, controllerId);
  }
}

interface ControllerData {
  type: string;
  html: string;
  js: string;
  css: string;
}

export default (props: RouteComponentProps<{ code: string }>) => {
  const code = props.match.params.code;
  const [controller, setController] = React.useState<Controller | null>(null);
  const [
    controllerParts,
    setControllerParts,
  ] = React.useState<ControllerData | null>(null);

  React.useEffect(() => {
    getController(props.match.params.code)
      .then(controller => setController(controller))
      .catch(err => window.location.replace('/'));
  }, []);

  React.useEffect(
    () => {
      if (!!controller) {
        controller.addEventListener(EventType.Disconnected, () => {
          window.location.replace('/');
        });

        fetch(`/controllers/${controller.controllerId}/controller.json`)
          .then(response => response.json())
          .then((data: ControllerData) =>
            Promise.all([
              fetch(
                `/controllers/${controller.controllerId}/${data.html}`
              ).then(response => response.text()),
              fetch(`/controllers/${controller.controllerId}/${data.js}`).then(
                response => response.text()
              ),
              fetch(`/controllers/${controller.controllerId}/${data.css}`).then(
                response => response.text()
              ),
            ])
          )
          .then(([html, js, css]) =>
            setControllerParts({ html, js, css, type: 'raw' })
          );
      }
    },
    [controller]
  );

  if (!controller || !controllerParts) {
    return <span>Loading...</span>;
  }

  React.useEffect(
    () => {
      if (!!controller && !!controllerParts) {
        const init = eval(controllerParts.js);
        init(controller);
      }
    },
    [controllerParts, controller]
  );

  return (
    <>
      <style>{controllerParts.css}</style>
      <div
        className="controller-container"
        dangerouslySetInnerHTML={{ __html: controllerParts.html }}
      />
    </>
  );
};
