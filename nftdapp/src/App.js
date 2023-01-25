import logo from './logo.svg';
import styles from './App.css';
import {Contract, providers, utils} from "ethers"
import React, {useEffect, useState, useRef} from "react"
import Web3Modal from "web3modal"
import {abi, CONTRACT_ADDRESS} from "./constants"

//npm install ethers           OR web3
//npm install web3modal        OR rainbowkit, thirdweb

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true)
    } catch(e){
      console.error(e);
    }
  }

  const getProviderOrSigner = async (needSigner = false) =>{
    
    const provider = await web3ModalRef.current.connect();
    console.log("current provider:", provider)
    const web3Provider = new providers.Web3Provider(provider)

    const {chainId} = await web3Provider.getNetwork()
    if (chainId !== 97){
      window.alert("Change network to BNB-chain")
      throw new Error ("Change network to BNB-chain")
      //TODO change network for the user to BNB-chain
    }

    if (needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const publicMint = async()=>{
    try {
      console.log("We are minting")
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.mint(
        "ipfs://QmSHNmiVg4b9yejnMYS1e4n5wsn1b3X8U2jqEKQeeaNGVq/0.json",
        {value: utils.parseEther("0.02")}
        )
      tx.wait();
      window.alert("Successfully minted")

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if (!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: 97,
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected])

  const renderButton = () =>{
    if (!walletConnected){
      return (
        <button onClick={connectWallet} className="button">
          Connect Wallet
        </button>
      )
    }
    else{
      return (
        <button className="button" onClick={publicMint}>
          Mint
        </button>
      );
    }
  }



  return (
    <div className = "main">
    
      <div>
        <h1 className="title">Simple NFT React dapp</h1>
        <div className="description">
            This is example collection
        </div>
        {renderButton()}
      </div>
    </div>

  );
}

export default App;
