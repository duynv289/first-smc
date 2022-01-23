import React, { useEffect, useState } from 'react';
import { Message, Button, Form } from 'semantic-ui-react';
import web3 from '../web3';
import voting from '../voting';
import { REQUIRED_NUMBER_PLAYER } from '../App';
import { useHistory } from 'react-router-dom';

function Deposit() {
  const [players, setPlayers] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDeposit, setIsDeposit] = useState(false);
  let history = useHistory();

  const onDeposit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setLoading(true);
    try {
      await voting.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei('0.01', 'ether'),
      });
      setIsDeposit(true);
      getPlayers();
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const getPlayers = () => {
    voting.methods
      .getPlayers()
      .call()
      .then((players) => {
        setPlayers(players.length);
        if (players.length === REQUIRED_NUMBER_PLAYER) {
          history.push('/vote');
        }
      });
  };

  useEffect(() => {
    async function prepair() {
      const accounts = await web3.eth.getAccounts();
      voting.methods
        .allowed(accounts[0])
        .call()
        .then((isDeposit) => {
          setIsDeposit(isDeposit ? isDeposit : false);
        });
    }
    getPlayers();
    prepair();
  });

  return (
    <Form onSubmit={onDeposit} error={!!errorMessage} success={isDeposit}>
      <h3>{isDeposit ? 'Please wait' : 'You need deposit to join'}</h3>
      <Message error header='Oops!' content={errorMessage} />
      <Button loading={loading} primary>
        Deposit!
      </Button>
      <Message
        success
        header='Your user registration was successful'
        content={`Please wait ${REQUIRED_NUMBER_PLAYER - players} guys`}
      />
    </Form>
  );
}

export default Deposit;
