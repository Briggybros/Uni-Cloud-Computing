import * as React from 'react';
import { render } from 'react-dom';
import { Route, Switch } from 'react-router';
import { BrowserRouter as Router } from 'react-router-dom';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import Code from './Code';
import ControllerWrapper from './ControllerWrapper';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ef6c00',
      light: '#ff9d3f',
      dark: '#b53d00',
      contrastText: '#000',
    },
    secondary: {
      main: '#37474f',
      light: '#62727b',
      dark: '#102027',
      contrastText: '#fff',
    },
  },
});

const mount = document.getElementById('app');

render(
  <MuiThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route exact path="/">
          <Code onConnect={code => window.location.replace(`/c/${code}`)} />
        </Route>
        <Route path="/c/:code" component={ControllerWrapper} />
      </Switch>
    </Router>
  </MuiThemeProvider>,
  mount
);
