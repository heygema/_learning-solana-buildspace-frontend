import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from './idl.json';
import {useEffect, useState} from 'react';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
  'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
  'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp',
];

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

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

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('Gif link:', inputValue);
    } else {
      console.log('Empty input. Try again.');
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
          {gifList.map((gif) => (
            <div className="gif-item" key={gif}>
              <img src={gif} alt={gif} />
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

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching gif list...');
      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  return (
    <div className="App">
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
