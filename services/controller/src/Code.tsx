import * as React from 'react';

import { Card, TextField, Button, FormHelperText } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

interface Props {
  classes: {
    card: string;
    button: string;
  };
  onConnect: (code: string) => any;
}

const Code = ({ classes, onConnect }: Props) => {
  const [code, setCode] = React.useState('');

  return (
    <Card className={classes.card}>
      <TextField
        label="Game Code"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase().substring(0, 4))}
      />
      {code.length !== 4 && (
        <FormHelperText>Enter a 4 character game code</FormHelperText>
      )}
      <Button
        className={classes.button}
        color="primary"
        disabled={code.length !== 4}
        onClick={() => onConnect(code)}
      >
        Connect
      </Button>
    </Card>
  );
};

export default withStyles({
  card: {
    width: 'fit-content',
    margin: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    marginTop: '1rem',
  },
})(Code);
