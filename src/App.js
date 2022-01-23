import { useState, useEffect } from 'react';
import { Container, Button, Grid } from 'semantic-ui-react';
import web3 from './web3';
import Deposit from './components/Deposit';
import Vote from './components/Vote';
import Withdraw from './components/Withdraw';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export const REQUIRED_NUMBER_PLAYER = 1;

function App() {
  const [selectedAccount, setSelectedAccount] = useState('');
  useEffect(() => {
    web3.eth.getAccounts().then((accounts) => {
      setSelectedAccount(accounts[0]);
    });
  });

  return (
    <Container>
      <link
        async
        rel='stylesheet'
        href='https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css'
      />
      <Grid style={{ marginTop: '15px' }}>
        <Grid.Row>
          <Grid.Column width={10}>
            <Router>
              <Switch>
                <Route exact path='/' component={Deposit} />
                <Route path='/vote' component={Vote} />
                <Route path='/withdraw' component={Withdraw} />
              </Switch>
            </Router>
          </Grid.Column>
          <Grid.Column width={4}>
            <Button disabled={selectedAccount !== ''}>
              {selectedAccount === '' ? 'Connect Wallet' : selectedAccount}
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default App;
