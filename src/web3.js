import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  window.ethereum.request({ method: 'eth_requestAccounts' });
  // We are in the browser *AND* running metamask
  web3 = new Web3(window.web3.currentProvider);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/af0812ed896347e98d915a3701133d13'
  );

  web3 = new Web3(provider);
}

export default web3;
