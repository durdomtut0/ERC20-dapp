import { BigNumber, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { addLiquidity, calculateTokens } from "./utils/addLiquidity";
import {
  getTokenBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfTokens,
} from "./utils/getAmounts";
import {
  getTokensAfterRemove,
  removeLiquidity,
} from "./utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "./utils/swap";

import logo from './logo.svg';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);

  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);
  /** Variables to keep track of amount */
  // `ethBalance` keeps track of the amount of Eth held by the user's account
  const [ethBalance, setEtherBalance] = useState(zero);
  // `reservedCD` keeps track of the Crypto Dev tokens Reserve balance in the Exchange contract
  const [reservedTokens, setReservedTokens] = useState(zero);
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  // cdBalance is the amount of `CD` tokens help by the users account
  const [tokenBalance, setTokenBalance] = useState(zero);
  // `lpBalance` is the amount of LP tokens held by the users account
  const [lpBalance, setLPBalance] = useState(zero);

  const [addEther, setAddEther] = useState(zero);
  // addCDTokens keeps track of the amount of CD tokens that the user wants to add to the liquidity
  // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
  // CD tokens that the user can add given a certain amount of ether
  const [addTokens, setAddTokens] = useState(zero);

  const [removeEther, setRemoveEther] = useState(zero);
  // removeCD is the amount of `Crypto Dev` tokens that would be sent back to the user based on a certain number of `LP` tokens
  // that he wants to withdraw
  const [removeTokens, setRemoveTokens] = useState("0");
  // amount of LP tokens that the user wants to remove from liquidity
  const [removeLPTokens, setRemoveLPTokens] = useState("0");

  const web3ModalRef = useRef();
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      // get the amount of eth in the user's account
      const _ethBalance = await getEtherBalance(provider, address);
      // get the amount of `Crypto Dev` tokens held by the user
      const _tokenBalance = await getTokenBalance(provider, address);
      // get the amount of `Crypto Dev` LP tokens held by the user
      const _lpBalance = await getLPTokensBalance(provider, address);
      // gets the amount of `CD` tokens that are present in the reserve of the `Exchange contract`
      const _reservedTokens = await getReserveOfTokens(provider);
      // Get the ether reserves in the contract
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalance(_ethBalance);
      setTokenBalance(_tokenBalance);
      setLPBalance(_lpBalance);
      setReservedTokens(_reservedTokens);
      //setReservedTokens(_reservedTokens);
      setEtherBalanceContract(_ethBalanceContract);
      //SET TOKEN APPROVAL 
    } catch (err) {
      console.error(err);
    }
  };

  const _addLiquidity = async()=>{
    try {
      const addEtherWei = utils.parseEther(addEther.toString());
      console.log(addEtherWei)
      console.log(addTokens)
      if (!addTokens.eq(zero) && !addEtherWei.eq(zero)){
          const signer = await getProviderOrSigner(true);
          setLoading(true);
          await addLiquidity(signer, addTokens, addEtherWei);
          setLoading(false)
          setAddTokens(zero)
          await getAmounts();
      }
      else{
        setAddTokens(zero);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setAddTokens(zero);
    }
  }
  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      // Convert the LP tokens entered by the user to a BigNumber
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      console.log(removeLPTokenWei)
      //const removeLPTokenWei  = removeLPTokens;
      // Get the Eth reserves within the exchange contract
      const _ethBalance = await getEtherBalance(provider, null, true);
      
      // get the crypto dev token reserves from the contract
      const cryptoDevTokenReserve = await getReserveOfTokens(provider);
      //console.log(cryptoDevTokenReserve)
      // call the getTokensAfterRemove from the utils folder
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      console.log(_removeEther)
      console.log(_removeCD)
      setRemoveEther(_removeEther);
      setRemoveTokens(_removeCD);
    } catch (err) {
      console.error(err);
    }
  };
  const _removeLiquidity = async () =>{
    try {
      
      const signer = await getProviderOrSigner(true)
      const removeLPTokenWei = utils.parseEther(removeLPTokens)
      setLoading(true)
      await removeLiquidity(signer, removeLPTokenWei)
      setLoading(false)
      await getAmounts()
      setRemoveTokens(zero)
      setRemoveEther(zero)
      
    } catch (error) {
        console.log(error)
        setLoading(false)
        setRemoveTokens(zero)
        setRemoveEther(zero)
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the BNB-testnet network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 97) {
      window.alert("Change the network to BNB-testnet");
      throw new Error("Change network to BNB-testnet");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };
  
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting its `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: 97,
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts();
    }
  }, [walletConnected]);
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className="button">
          Connect wallet
        </button>
      );
    }
    if (loading) {
      return <button className="button">Loading...</button>;
    }
    if (liquidityTab){
      return (
        <div>
          <div className="description">
            Your balances:
            {/* Hi */}
            {utils.formatEther(tokenBalance)} Tokens
            <br/>
            {utils.formatEther(ethBalance)} Eth
            <br/>
            {utils.formatEther(lpBalance)} LP tokens
          </div>
          <div>
            {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
            how much initial liquidity he wants to add else just render the state where liquidity is not zero and
            we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
            {utils.parseEther(reservedTokens.toString()).eq(zero)?(
              <div>
                <input
                  type ="number"
                  placeholder="Amount of ETH"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className = "input"
                />
                <input
                  type="number"
                  placeholder = "Amount of Tokens"
                  onChange={(e)=> setAddTokens(BigNumber.from(utils.parseEther(e.target.value || "0")))}
                  className="input"
                />
                <button className="button1" onClick={_addLiquidity}>Add liquidity</button>
              </div>
            ):(
              <div>
               <input type="number" placeholder="Amount of ETH" 
                  onChange={async (e)=>{
                    setAddEther(e.target.value || "0")
                    const _addTokens = await calculateTokens(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedTokens
                    );
                    setAddTokens(_addTokens);
                    {/* amountETH/reserveETH = amountToken/reserve/Token */}
                  }}
                  className = "input"
                />
                <div className="inputDiv">
                      {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                      {`You will need ${utils.formatEther(addTokens)} Crypto Dev
                      Tokens`}
                </div>
                <button className="button1" onClick={_addLiquidity}>
                  Add Liquidity
                </button>
              </div>
            )}
            <div>
              <input type = "number" placeholder="Amount of LP Tokens"
                  onChange={async (e) => {
                      console.log(e.target.value)
                      setRemoveLPTokens(e.target.value || "0")
                      console.log(utils.formatEther(removeLPTokens))
                      await _getTokensAfterRemove(e.target.value || "0")
                  }}
                  className ="input"
              />
              <div className="inputDiv">
                {`You will get ${utils.formatEther(removeTokens)} Crypto
                Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className="button1" onClick={_removeLiquidity}>
                Remove Liquidity
              </button>

            </div>
          </div>

        </div>
      )
    }
  }


  return (
    <div >
      <title> Decentralized Exchange </title>
      <div className="main">
          <div>
            <h1 className="title">Decentralized Exchange</h1>
            <div className="description">
                  Swap ETH &#60; &#62; Token
            </div>
            <div>
              <button className="button" onClick={()=>setLiquidityTab(true)}>
                Liquidity
              </button>
              <button className="button" onClick={()=>setLiquidityTab(false)}>
                Swap
              </button>
            </div>
            {renderButton()}
          </div>
          IMG here
      </div>
      <footer className="footer">
        Hi
      </footer>
    </div>
  );
}

export default App;
