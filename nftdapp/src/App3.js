import './App.css';
import { Contract, providers, utils } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import {abi, NFT_CONTRACT_ADDRESS} from "./constants";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const web3modal = useRef();

  const connectWallet = async () => {
    try {
      setWalletConnected(await getProviderORSigner());
      return;
    } catch (error) {
      console.error(error);
    }
  }

  const handleClick = async () => {
    try {
      web3modal.current = new Web3Modal({
        network: 97,
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    } catch (error) {
      console.error(error);
    }
  }

  const getProviderORSigner = async (needSigner = false) => {
    const provider = await web3modal.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 97) {
      window.alert("Please connect to Goerli Network");
      throw new Error("Please connect to Goerli Network");
    }

    if (needSigner) {
      const signer = await web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  useEffect(() => { 
    //localStorage.setItem("walletConnected", walletConnected);;
    if (walletConnected) {
      setIsHidden(true);
      return;
    };
    setIsHidden(false);
  }, [walletConnected])

  return (
    <div className="main">
      <div>
        <h1 className="title">NFT Marketplace</h1>
        <div className="description">This is example collection</div>
      </div>
      <div>
          <div>
            {!isHidden ?
              <button onClick={handleClick} className="button">Create Wallet</button> : null
            }
          </div>
      </div>
    </div>
  );
}

export default App;
