
import './App.css';
import {useState,useRef,useEffect} from "react";
import Web3 from "web3";
import contractAbi from "./abi.json";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Moralis from "moralis"

function App() {
  const contractAddress="0xE001Ed566CBFBB86f6842fA14BA2459d1f65Fc5b";
  const rpcUrl="https://data-seed-prebsc-1-s1.binance.org:8545/"
  const nftPrice="0.15";
  const [mweb3,setMweb3]=useState();
  const [mintData,setMintData]=useState();
  const [walletAddress,setWallet]=useState();
  const [loading,setLoading]=useState(false);
  const [amountToMint,setAmount]=useState(1);
  const amountInput=useRef();
  const [userNFTs,setUserNFTs]=useState([]);

  useEffect(async()=>{
    const web3 = new Web3(rpcUrl);
    const contract = new web3.eth.Contract(contractAbi,contractAddress);
    const totalMint=await contract.methods.totalMint().call();
    const maxMint=await contract.methods.maxMint().call();
    setMintData({
      totalMint,
      maxMint
    });
  },[])

  const getUserNFTs=async(address)=>{
    setLoading(true)
    const serverUrl = "https://zkdlwrji3tzu.usemoralis.com:2053/server";
    const appId = "cFAG0AwfIaUNBAdKC05HIaN2dYmkfM1bj3Rshl9d";
    await Moralis.start({ serverUrl, appId });
    const options = { address, chain: "bsc testnet" };
    const NFTs = await Moralis.Web3.getNFTs(options);
    const filtered=NFTs.filter((v)=>Web3.utils.toChecksumAddress(v.token_address)===Web3.utils.toChecksumAddress(contractAddress))
    const filtered2=filtered.map((v)=>v.token_uri)
    let finalData=[];
    for (let i=0;i<filtered2.length;i++){
      const req=await fetch(filtered2[i]);
      const data=await req.json();
      finalData.push(data.image)
    }
    setUserNFTs(finalData);
    setLoading(false)

  }

  const walletConnect=async()=>{
    const address = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = window.ethereum;
    const web3 = new Web3(provider);
    setMweb3(web3);
    setWallet(address[0]);
    await getUserNFTs(address[0]);
  }

  const mintHandler=async()=>{
    try{
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const contract = new mweb3.eth.Contract(contractAbi,contractAddress);
      const tx=await contract.methods.mint(walletAddress,amountToMint).send({from:walletAddress,value:amountToMint*Web3.utils.toWei(nftPrice, 'ether')});
      if(tx){
        toast.success('🦄 NFT minted successfully.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
          setTimeout(()=>{getUserNFTs(walletAddress)},3000)
          setMintData({
            ...mintData,
            totalMint:parseInt(mintData.totalMint)+parseInt(amountToMint),
          });
      }
      else{
        toast.error('Someting went wrong.', {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
      }
    }
    catch(err){
      toast.error("Someting went wrong.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
    }


  }
  return (
    <div className="container-fluid main-screen">
      <ToastContainer />
    <div className="container">
      {!walletAddress?<div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6 text-center">
	  <h1>BNBNFTS</h1>
          <h2>Please Connect</h2>
          <h4>Connect to the network (Accepted Wallet: Metamask).</h4>
          <a onClick={walletConnect} className="btn main-btn mb-2">CONNECT</a>
          <h3>Price : 0.15 BNB (+ Gas fees)</h3>
        </div>
        <div className="col-md-3"></div>
      </div>:<><div className="row">
					<div className="col-md-3"></div>
					<div className="col-md-6 text-center">
						<h2>AVAILABLE</h2>
						<a className="btn main-btn mint">{mintData&&`${mintData?.totalMint}/${mintData?.maxMint}`}</a>
						<div className="input-groups">
						  	<button onClick={()=>{amountToMint>1&&setAmount(amountToMint-1)}} className="quantity-field me-1">-</button>
						  	<input value={amountToMint} type="number" name="quantity" className="quantity-field" ref={amountInput}/>
						  	<button onClick={()=>{amountToMint<mintData?.maxMint&&setAmount(amountToMint+1)}} className="quantity-field ms-1">+</button>
						</div>
						<a onClick={mintHandler} className="btn main-btn mint mb-2">MINT</a>
						<h3>Price : 0.15 BNB (+ Gas fees)</h3>
					</div>
					<div className="col-md-3"></div>


        


				</div>
        
        
        <div className="row mt-3">
        <div className="col-md-3"></div>
        <div className="col-md-6 text-center">
          <h2>Your Nfts</h2>
          <div className="d-flex w-100 align-items-center justify-content-center nft-container">
          {loading&&<div class="spinner-border text-light" role="status"> <span class="visually-hidden">Loading...</span> </div>}
          {!loading&&userNFTs&&userNFTs.map((v)=><div className="card">
          <div className="card-body">
            <img src={v} width={100}/>
          </div>
          </div>)}
          </div>
          </div>
        
        <div className="col-md-3"></div>
      </div>

      </>
        }
    </div>
  </div>
  );
}

export default App;
