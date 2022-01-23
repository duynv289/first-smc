import React, { useEffect, useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import web3 from '../web3';
import voting from '../voting';
import { useHistory } from 'react-router-dom';
function Withdraw() {
  const [loading, setLoading] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  let history = useHistory();
  const onWithdraw = async () => {
    const accounts = await web3.eth.getAccounts();
    const owner = voting.methods.owner().call();
    setErrorMessage('');
    setLoading(true);
    try {
      // const amount = owner === accounts[0] ? '300' : '100';
      const amount = '0.01';
      await voting.methods.withdraw(web3.utils.toWei(amount, 'ether')).send({
        from: accounts[0],
      });
      history.push('/');
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function getAvarageScore() {
      const accounts = await web3.eth.getAccounts();
      const owner = await await voting.methods.owner().call();
      const players = await voting.methods.getPlayers().call();
      let totalScore = await voting.methods.totalScore().call();
      let counter = await voting.methods.counter().call();
      totalScore += (players.length - counter) * 10;
      counter += players.length - counter;
      const averageScore = totalScore / counter;
      if (averageScore >= 7) {
        setCanWithdraw(owner === accounts[0]);
      } else {
        const isJoin = await voting.methods.allowed(accounts[0]).call();
        setCanWithdraw(isJoin);
      }
    }
    getAvarageScore();
  }, []);

  return canWithdraw ? (
    <Form onSubmit={onWithdraw} error={!!errorMessage}>
      <Message info>
        <Message.Header>Time up</Message.Header>
        <p>Please withdraw</p>
      </Message>
      <Button primary loading={loading}>
        Withdraw!
      </Button>
      <Message error header='Oops!' content={errorMessage} />
    </Form>
  ) : (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        history.push('/');
      }}
    >
      <Message info>
        <Message.Header>Game is ending</Message.Header>
        <p>Please back to home</p>
      </Message>
      <Button primary>Back!</Button>
    </Form>
  );
}

export default Withdraw;
