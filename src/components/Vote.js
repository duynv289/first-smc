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
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  let history = useHistory();
  const getTimeCounter = () => {
    voting.methods
      .checkCounterTime()
      .call()
      .then((timer) => {
        setMinutes(parseInt(timer / 60));
        setSeconds(parseInt(timer % 60));
      });
  };

  useEffect(() => {
    async function prepair() {
      const accounts = await web3.eth.getAccounts();
      const isJoin = await voting.methods.allowed(accounts[0]).call();
      setIsJoin(isJoin);
      // if (!isJoin) {
      //   history.push('/');
      // }
      const isVote = await voting.methods.voted(accounts[0]).call();
      setIsVote(isVote);
    }
    prepair();
    getTimeCounter();
  }, [history]);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
          history.push('/withdraw');
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  const onVote = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
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
          <Message.Header>
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </Message.Header>
          <p>Please mark score before timeup</p>
        </Message>
      )}

      {!isVote ? (
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
