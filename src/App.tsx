import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Unity, { UnityContext } from "react-unity-webgl";
import { useEtherBalance, useEthers, useSendTransaction } from '@usedapp/core';
import { formatEther,formatUnits} from '@ethersproject/units'
const unityContext = new UnityContext({
  loaderUrl: "unity/Build/Build.loader.js",
  dataUrl: "unity/Build/Build.data",
  frameworkUrl: "unity/Build/Build.framework.js",
  codeUrl: "unity/Build/Build.wasm",
});

function EtherBalanceToUnity(amount : string) {
  unityContext.send("GetAddressWallet", "EtherBalanceToUnity", amount);
  console.log(amount);
}

const STAKING_CONTRACT = '0x00000000219ab540356cBB839Cbe05303d7705Fa'
const App = () => {
  const { activateBrowserWallet, account , deactivate} = useEthers();
  const { sendTransaction, state } = useSendTransaction();
 // const { sendTransaction } = useSendTransaction({ transactionName: 'Send Ethereum' });
  const etherBalance = useEtherBalance(account);
  const stakingBalance = useEtherBalance(STAKING_CONTRACT)

  const [isGameOver, setIsGameOver] = useState(false);
  const [userName, setUserName] = useState("");
  const [score, setScore] = useState(0);

  useEffect(function(){
    unityContext.on("SendTrans", function (address, amount) {
      console.log(address, amount);
     
      sendTransaction({ to: address, value: amount});
    });
    
    // unityContext.on("SendTranscationFromUnity",( address, amount) => {
      
    //   sendTransaction({ to: address, value: amount })
    // });

    unityContext.on("GameOver", function (userName, score) {
      console.log(userName, score);
      // setIsGameOver(true);
      // setUserName(userName);
      // setScore(score);
    });

    unityContext.on("Disconnect", function(){
      deactivate();
    });

  },[]);

  return <div>
    <div>
      <button onClick={() => { 
            activateBrowserWallet(); 
          }}>Connect</button>

          {account && <p>Account: {account}</p>}
          {etherBalance && EtherBalanceToUnity(formatEther(etherBalance))}
    </div>
    <div>
    {account && <button onClick={deactivate}> Disconnect </button>}
      {stakingBalance && <p>ETH2 staking balance: {formatEther(stakingBalance)} ETH </p>}
    {isGameOver === true && <p>{`Game Over! ${userName} ${score} points`}</p>}
      <Unity unityContext={unityContext} />
    </div>
  </div>
    
}

export default App;