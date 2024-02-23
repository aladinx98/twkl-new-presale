import React, { useEffect, useState } from "react";
import './style.css';
// import logo from '../../images/logo.png';
import coin from '../../images/HRN.png';
import PresaleAbi from '../../Helpers/presaleAbi.json';
import USDTAbi from '../../Helpers/usdtAbi.json';
import TokenModal from './TokenModal';
import { list } from '../../Helpers/tokenlist';
import { FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import Web3 from 'web3';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';

const isValid = (regex) => (input) => regex.test(input);
const numberRegex = /^\d*\.?\d*$/;
const isValidNumber = isValid(numberRegex);

function MainSection() {
  const { isConnected, address } = useAccount();
  const cAddress = "0xb57c85406cB24D0109a1E55a791ab0c081bbE25D";
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";

  const [data, setData] = useState({
    bnb: "",
    gart: "",
  });
  const [open, setOpen] = useState(false);
  const [currentToken, setCurrentToken] = useState(list[0]);
  const [approvalDone, setApprovalDone] = useState(false);
  const gartVal = currentToken.name === "BNB" ? 208571 : 83;

  const webSupply_Binance = new Web3("https://1rpc.io/bnb");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [timer, setTimer] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const endDate = new Date("2024-03-15T00:00:00Z"); // Set your presale end date here
      const now = new Date();
      const distance = endDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimer(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (distance < 0) {
        clearInterval(interval);
        setTimer("Presale Ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // const processBuy = async () => {
  //   if (!data.bnb || !data.gart) {
  //     toast.error("Please enter the correct value.");
  //     return;
  //   }

  //   try {
  //     const contract = new webSupply_Binance.eth.Contract(PresaleAbi, cAddress);
  //     let bnbValue = webSupply_Binance.utils.toWei(data.bnb.toString());

  //     const transaction = await prepareWriteContract({
  //       address: cAddress,
  //       abi: PresaleAbi,
  //       functionName: "buyHRN",
  //       value: bnbValue,
  //       from: address,
  //     });

  //     const toastId = toast.loading("Processing transaction...");
  //     const receipt = await writeContract(transaction);

  //     toast.success("Transaction completed successfully", { id: toastId });
  //     setData({ bnb: "", gart: "" });
  //   } catch (error) {
  //     toast.error("Something went wrong with the transaction!");
  //     console.error(error);
  //   }
  // };

  const buyWithUsdt = async () => {
    try {
      const contract = new webSupply_Binance.eth.Contract(PresaleAbi, cAddress);
      let bnbValue = webSupply_Binance.utils.toWei(data.bnb.toString());
      const bnbValueNumber = Number(bnbValue);
      const buyTransaction = await prepareWriteContract({
        address: cAddress,
        abi: PresaleAbi,
        functionName: "buyWithUSDT",
        args: [bnbValueNumber],
        from: address,
      });

      const toastId = toast.loading("Processing Buy Transaction..");
      await writeContract(buyTransaction);

      toast.success("Buy Transaction completed successfully", { id: toastId });
      setData({ bnb: "", gart: "" });
    } catch (error) {
      toast.error("Something went wrong with the transaction!");
      console.error(error);
    }
  };

  const approveTransaction = async () => {
    try {
      const tokenContract = new webSupply_Binance.eth.Contract(USDTAbi, usdtAddress);
      let bnbValue = webSupply_Binance.utils.toWei(data.bnb.toString());
      const bnbValueNumber = Number(bnbValue);
      const approvalTransaction = await prepareWriteContract({
        address: usdtAddress,
        abi: USDTAbi,
        functionName: "approve",
        args: [cAddress, bnbValueNumber],
        from: address,
      });

      const toastId = toast.loading("Approving transaction...");
      const hash = await writeContract(approvalTransaction);
      toast.loading("Processing Approval Transaction..", { id: toastId });
      await waitForTransaction(hash);
      toast.dismiss(toastId);
      toast.success("Approval completed successfully");
      setApprovalDone(true);
    } catch (error) {
      toast.error("Something went wrong with the transaction!");
      console.error(error);
    }
  };

  return (
    <>
      <br />
      <br />
      <div className="flex main-section shadow md:shadow-lg">
        <div className="main-section-form card">
          <div class="block p-6 bg-gradient-to-r from-stone-500 to-stone-700 border border-gray-200 rounded-lg shadow hover:bg-gray-100  dark:border-gray-700 dark:hover:bg-gray-700">
            <img className="mx-auto rounded-full w-100 h-20" src={coin} alt="image description" />
            <br></br>
            <div>
              <div class="flex m-1 relative items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all bg-red-500 rounded-xl group">
                <span class="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-red-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                  <span class="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                </span>
                <span class="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full translate-y-full bg-red-600 rounded-2xl group-hover:mb-12 group-hover:translate-x-0"></span>
                <span class="relative w-full text-center text-white transition-colors duration-200 ease-in-out group-hover:text-white">Presale ends in: {timer}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-center m-2">
            <button class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
              <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Tier1 $0.012
              </span>
            </button>
            <button
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
              disabled={true}
              style={{ pointerEvents: "none", backgroundColor: "#f3f4f6", color: "#9ca3af" }}
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Tier2 $0.024
              </span>
            </button>

            <button
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
              disabled={true}
              style={{ pointerEvents: "none", backgroundColor: "#f3f4f6", color: "#9ca3af" }}
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Tier3 $0.036
              </span>
            </button>


          </div>

          <br />
          <p className="mgtp text-yellow-600">Pay with</p>
          <div className="form-group">
            <input
              type="text"
              value={data.bnb}
              className="text-black py-2 px-4 w-3/4 border-r border-gray-300 focus:outline-none"
              onChange={(e) => {
                const val = e.target.value
                  .split("")
                  .filter((el) => isValidNumber(el))
                  .join("");
                setData({
                  ...data,
                  bnb: val,
                  gart: val * gartVal,
                });
              }}
            />
            <div

              className="py-2 px-4 bg-zinc-800 text-white font-semibold rounded-md hover:bg-zinc-900 focus:outline-none"
            >
              <img src={currentToken.icon} alt="snk" />
              <p style={{ color: "white" }}>{currentToken.name}</p>
              {/* <FiChevronDown className="text-black" /> */}
            </div>
          </div>

          <p className="mgtp text-yellow-600">You will get</p>
          <div className="form-group">
            <input
              type="text"
              className="text-black py-2 px-4 w-3/4 border-r border-gray-300 focus:outline-none"
              value={data.gart}
              onChange={(e) => {
                const val = e.target.value
                  .split("")
                  .filter((el) => isValidNumber(el))
                  .join("");
                setData({
                  ...data,
                  gart: val,
                  bnb: val / gartVal,
                });
              }}
            />
            <div className="py-2 px-4 bg-zinc-800 text-white font-semibold rounded-md hover:bg-zinc-900 focus:outline-none">
              <img src={coin} alt="snk" />
              <p style={{ color: "white" }}>HRN</p>
            </div>
          </div>
          <div style={{ textAlign: "center", margin: "0.5em 0" }}>
            {currentToken.name === "USDT" && !approvalDone && (
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                onClick={approveTransaction}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-dark dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Approve
                </span>
              </button>
            )}

            {currentToken.name === "USDT" && approvalDone && (
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                onClick={buyWithUsdt}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-dark dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Buy
                </span>
              </button>
            )}

            {/* {currentToken.name === "BNB" && (
              <button
                className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                onClick={processBuy}
              >
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-dark dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  Buy
                </span>
              </button>
            )} */}

          </div>
          <div className="smart">
            <i className="fa-brands fa-youtube fa-bounce" style={{ color: '#ef4444' }}></i>
            <a href="/" target="_blank">How to buy HRN</a>
          </div>
        </div>

        <TokenModal
          open={open}
          setOpen={setOpen}
          handleOpen={handleOpen}
          handleClose={handleClose}
          currentChain={currentToken}
          setCurrentChain={setCurrentToken}
          setData={setData}
        />
      </div>
    </>
  );
};

export default MainSection;
