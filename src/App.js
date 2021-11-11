import {useEffect, useRef, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {Program, Provider, web3} from '@project-serum/anchor';

import idl from './idl.json';
import keypair from './keypair.json';

const {SystemProgram} = web3;

let arrKeypair = Object.values(keypair._keypair.secretKey);
const secret = new Uint8Array(arrKeypair);
let baseAccount = web3.Keypair.fromSecretKey(secret);

let programId = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: 'processed',
};

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  const [isOn, setOn] = useState(false);
  let timeout = useRef(null).current;

  const checkWallet = async () => {
    try {
      const {solana} = window;
      if (solana && solana.isPhantom) {
        console.log('Legit phantom wallet', solana);
        const response = await solana.connect({onlyIfTrusted: true});
        // const response = await solana.request({
        //   method: 'connect',
        //   // params: {onlyIfTrusted: true},
        // });
        let newAddress = response.publicKey.toString();
        console.log('Connected with public key :', newAddress);
        setWalletAddress(newAddress);
        return;
      }

      alert('Solana object not found! Get a Phantom Wallet 👻');
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    const {solana} = window;
    if (solana) {
      const response = await solana.connect();
      let newAddress = response.publicKey.toString();
      console.log('Connected with public key', newAddress);
      setWalletAddress(newAddress);
    }
  };

  const onInputChange = (e) => {
    let {value} = e.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No gif link given!');
      return;
    }
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      setInputValue('');
      console.log('Gif sent!!', inputValue);
      await getGifList();
    } catch (err) {
      console.error('Error sending gif', err);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time create account
          </button>
        </div>
      );
    }

    return (
      <div className="connected-container">
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          placeholder="Enter gif link!"
        />
        <button className="cta-button submit-gif-button" onClick={sendGif}>
          Submit
        </button>
        <div className="gif-grid">
          {gifList.map(({gifLink}, index) => (
            <div className="gif-item" key={index}>
              <img src={gifLink} alt={gifLink} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    window.addEventListener('load', async () => {
      await checkWallet();
    });
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log('got the account', account);
      setGifList(account.gifList);
    } catch (error) {
      console.log('ERror getting gifs', error);
      setGifList(null);
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programId, provider);

      console.log('ping');

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        'created a new baseAccount with address, ',
        baseAccount.publicKey
      );
      await getGifList();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching gif list...');
      getGifList();
    }
  }, [walletAddress]);

  useEffect(() => {
    timeout = setTimeout(() => {
      setOn(!isOn);
    }, 100);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  });

  return (
    <div className={`App ` + (isOn ? 'on' : 'off')}>
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">😂GIF IS LYFE🤯</p>
          <p className="sub-text">ETH MAXIS ✨✨✨✨ OFF </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
