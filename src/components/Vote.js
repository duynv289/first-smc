import React, { useState, useEffect } from 'react';
import { Button, Form, Message, Input } from 'semantic-ui-react';
import web3 from '../web3';
import voting from '../voting';
import { useHistory } from 'react-router-dom';

function Vote() {
  const [errorMessage, setErrorMessage] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVote, setIsVote] = useState(false);
  const [isJoin, setIsJoin] = useState(false);
  const [timer, setTimer] = useState(0);

  let history = useHistory();
  const getTimeCounter = () => {
    voting.methods
      .checkCounterTime()
      .call()
      .then((timer) => {
        setTimer(parseInt(timer));
      });
  };

  useEffect(() => {
    async function prepair() {
      const accounts = await web3.eth.getAccounts();
      const isJoin = await voting.methods.allowed(accounts[0]).call();
      setIsJoin(isJoin);
      const isVote = await voting.methods.voted(accounts[0]).call();
      setIsVote(isVote);
    }
    prepair();
    getTimeCounter();
  }, []);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (parseInt(timer) === 0) {
        clearInterval(myInterval);
        history.push('/withdraw');
      } else if (parseInt(timer) > 0) {
        setTimer(parseInt(timer) - 1);
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  const renderTimer = () => {
    var days = Math.floor(timer / 86400);
    var hours = Math.floor((timer - days * 86400) / 3600);
    var minutes = Math.floor((timer - days * 86400 - hours * 3600) / 60);
    var seconds = timer - days * 86400 - hours * 3600 - minutes * 60;
    return (
      <p>
        {days}:{hours < 10 ? `0${hours}` : hours}:
        {minutes < 10 ? `0${minutes}` : minutes}:
        {seconds < 10 ? `0${seconds}` : seconds}
      </p>
    );
  };

  const onVote = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setErrorMessage('');
    setLoading(true);
    try {
      await voting.methods.voteScore(score).send({
        from: accounts[0],
      });
      setIsVote(true);
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };
  return (
    <Form onSubmit={onVote} error={!!errorMessage} success={isVote}>
      {isVote ? (
        <Message
          success
          header='Your user vote was successful'
          content='Please wait'
        />
      ) : (
        <Message info>
          <Message.Header>{renderTimer()}</Message.Header>
          <p>Please mark score before timeup</p>
        </Message>
      )}

      {isJoin && !isVote ? (
        <Input
          placeholder='Score'
          value={score}
          onChange={(event) => setScore(event.target.value)}
        />
      ) : null}

      {isJoin && !isVote ? (
        <Button style={{ marginLeft: '10px' }} loading={loading} primary>
          Vote!
        </Button>
      ) : null}
      <Message error header='Oops!' content={errorMessage} />
    </Form>
  );
}

export default Vote;
