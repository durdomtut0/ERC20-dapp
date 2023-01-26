import logo from './logo.svg';
import styles from './App.css';
import {Contract, providers, utils} from "ethers"
import React, {useEffect, useState, useRef} from "react"
import Web3Modal from "web3modal"
import {abi, CONTRACT_ADDRESS} from "./constants"

//npm install ethers           OR web3 OR wagmi
//npm install web3modal        OR rainbowkit, thirdweb

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [inputURL, setInputURL] = useState("");
  const [tokensMinted, setTokensMinted] = useState(0);

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
      //setInputURL(inputURL.value)
      console.log("input URL:", inputURL)
      

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

  const numberOfTokensMinted = async() =>{
    try {
      const provider = await getProviderOrSigner(false);
      const nftContract = new Contract(CONTRACT_ADDRESS, abi, provider);
      const tx = await nftContract.totalSupply();
      //tx.wait();
      console.log(tx);
      setTokensMinted(Number(tx));
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
      numberOfTokensMinted();
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
  const handleURL = e => {
    setInputURL(e.target.value)
  }

  return (
    <div className = "main">
    
      <div>
        <h1 className="title">Simple NFT React dapp</h1>
        <div className="description">
            Provide URL of NFT
        </div>
        <input type="text" class = "inputText" onChange={handleURL} value={inputURL} placeholder="url" />

        <div className="description">
            This is example collection
        </div>
        {renderButton()}
        <br/>

        <div className="description">
            Numer of tokens minted {tokensMinted}/10.
        </div>
      </div>
    </div>

  );
}

export default App;
