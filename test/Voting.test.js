const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledVoting = require('../ethereum/build/Voting.json');

let accounts;
let voting;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  voting = await new web3.eth.Contract(JSON.parse(compiledVoting.interface))
    .deploy({ data: compiledVoting.bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Voting', () => {
  it('deploys a voting contract', () => {
    assert.ok(voting.options.address);
  });

  it('allows one account to enter', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });
    const players = await voting.methods.getPlayers().call();
    const isAllowed = await voting.methods.allowed(accounts[0]).call();
    const timer = await voting.methods.checkCounterTime().call();
    console.log(timer);
    assert.equal(isAllowed, true);
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  xit('allows two account to enter', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[1],
      gas: '1000000',
    });
    const players = await voting.methods.getPlayers().call();

    assert.equal(accounts[1], players[1]);
    assert.equal(2, players.length);
  });

  xit('allows three account to enter', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[1],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[2],
      gas: '1000000',
    });
    const players = await voting.methods.getPlayers().call();

    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  xit('one account vote mark', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[1],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[2],
      gas: '1000000',
    });
    await voting.methods.voteScore(8).send({
      from: accounts[0],
      gas: '1000000',
    });

    const counter = await voting.methods.counter().call();
    assert.equal(1, counter);
  });

  xit('two account vote mark', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[1],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[2],
      gas: '1000000',
    });
    await voting.methods.voteScore(8).send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.voteScore(8).send({
      from: accounts[1],
      gas: '1000000',
    });

    const counter = await voting.methods.counter().call();
    assert.equal(2, counter);
  });
  xit('three account vote mark', async () => {
    await voting.methods.contribute().send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[1],
      gas: '1000000',
    });

    await voting.methods.contribute().send({
      from: accounts[2],
      gas: '1000000',
    });
    await voting.methods.voteScore(8).send({
      from: accounts[0],
      gas: '1000000',
    });

    await voting.methods.voteScore(4).send({
      from: accounts[1],
      gas: '1000000',
    });

    await voting.methods.voteScore(5).send({
      from: accounts[2],
      gas: '1000000',
    });

    const counter = await voting.methods.counter().call();

    assert.equal(3, counter);
  });
});
