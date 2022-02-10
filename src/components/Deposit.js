import React, { useEffect, useState } from 'react';
import { Message, Button, Form } from 'semantic-ui-react';
import web3 from '../web3';
import voting from '../voting';
import { usdtCompound } from '../erc20';
import { REQUIRED_NUMBER_PLAYER } from '../App';
import { useHistory } from 'react-router-dom';

function Deposit() {
  const [players, setPlayers] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDeposit, setIsDeposit] = useState(false);
  const [isApprove, setIsApprove] = useState(false);
  let approveAmount =
    '115792089237316195423570985008687907853269984665640564039457584007913129639935'; //(2^256 - 1 )
  let history = useHistory();

  const onApprove = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setErrorMessage('');
    setLoading(true);
    try {
      const isSuccess = await usdtCompound.methods
        .approve(voting.options.address, approveAmount)
        .send({
          from: accounts[0],
        });
      setIsApprove(isSuccess);
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const onDeposit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setErrorMessage('');
    setLoading(true);
    try {
      await voting.methods.contribute().send({
        from: accounts[0],
      });
      setIsDeposit(true);
      getPlayers();
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const getTimeCounter = () => {
    voting.methods
      .checkCounterTime()
      .call()
      .then((timer) => {
        setTimer(timer);
        checkGotoVote();
      });
  };

  const getPlayers = () => {
    voting.methods
      .getPlayers()
      .call()
      .then((players) => {
        setPlayers(players.length);
        checkGotoVote();
      });
  };
  const checkGotoVote = () => {
    console.log(timer);
    console.log(players);
    if (parseInt(timer) !== 0 && players === REQUIRED_NUMBER_PLAYER) {
      history.push('/vote');
    }
  };
  useEffect(() => {
    async function prepair() {
      const accounts = await web3.eth.getAccounts();
      const isDeposit = await voting.methods.allowed(accounts[0]).call();
      setIsDeposit(isDeposit ? isDeposit : false);
      const amoutApprove = await usdtCompound.methods
        .allowance(accounts[0], voting.options.address)
        .call();
      setIsApprove(amoutApprove !== '0');
    }
    getTimeCounter();
    getPlayers();
    prepair();
  });

  return (
    <Form
      onSubmit={isApprove ? onDeposit : onApprove}
      error={!!errorMessage}
      success={isDeposit}
    >
      <h3>{isDeposit ? 'Please wait' : 'You need deposit to join'}</h3>
      <Message error header='Oops!' content={errorMessage} />
      {isDeposit ? null : (
        <Button loading={loading} primary>
          {isApprove ? 'Deposit!' : 'Approve!'}
        </Button>
      )}
      <Message
        success
        header='Your registration was successful'
        content={
          REQUIRED_NUMBER_PLAYER - players
            ? `Please wait ${REQUIRED_NUMBER_PLAYER - players} guys`
            : ''
        }
      />
    </Form>
  );
}

export default Deposit;
