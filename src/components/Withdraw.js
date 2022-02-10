import React, { useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import web3 from '../web3';
import voting from '../voting';
function Withdraw() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const onWithdraw = async () => {
    const accounts = await web3.eth.getAccounts();
    const owner = await voting.methods.owner().call();
    setErrorMessage('');
    setLoading(true);
    try {
      let isWin = false;
      const avarageScore = await voting.methods.getAvarageScore().call();
      console.log(avarageScore);
      if (
        (avarageScore >= 7 && owner === accounts[0]) ||
        (avarageScore < 7 && owner !== accounts[0])
      ) {
        isWin = true;
      }
      if (isWin) {
        const success = await voting.methods.withdraw().send({
          from: accounts[0],
        });
        if (success) {
          alert('Withdraw success');
        } else {
          alert('Withdraw fail');
        }
      } else {
        alert('You are not winner');
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  return (
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
  );
}

export default Withdraw;
