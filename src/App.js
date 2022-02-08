import { useState, useEffect } from 'react';
import { Container, Button, Grid } from 'semantic-ui-react';
import web3 from './web3';
import Deposit from './components/Deposit';
import Vote from './components/Vote';
import Withdraw from './components/Withdraw';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import voting from './voting';

export const REQUIRED_NUMBER_PLAYER = 3;

function App() {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function prepair() {
      const accounts = await web3.eth.getAccounts();
      setSelectedAccount(accounts[0]);
      const owner = await voting.methods.owner().call();
      setIsOwner(accounts[0] === owner);
    }
    prepair();
  });

  const onClickReset = async () => {
    const accounts = await web3.eth.getAccounts();
    setLoading(true);
    try {
      await voting.methods.reset().send({
        from: accounts[0],
      });
    } catch (err) {}
    setLoading(false);
  };

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
            {isOwner ? (
              <Button
                loading={loading}
                onClick={onClickReset}
                primary
                style={{ marginTop: '15px' }}
              >
                Reset!
              </Button>
            ) : null}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
}

export default App;
