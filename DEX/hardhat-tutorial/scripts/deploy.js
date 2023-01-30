const {ethers} = require("hardhat");
require("dotenv").config({path: ".env"});
const {TOKEN1_ADDRESS}  = require("../constants");


async function main() {
  //TODO 
  const token1Address = TOKEN1_ADDRESS;
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedExchangeContract = await exchangeContract.deploy(
    token1Address
  );
  await deployedExchangeContract.deployed();
  console.log("Exhchange address: ", deployedExchangeContract.address);

  console.log(`Verifying contract on Etherscan...`);

  //const myTimeout = setTimeout(console.log("hi"), 5000);

  const WAIT_BLOCK_CONFIRMATIONS = 6;
  await deployedExchangeContract.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);


  await run(`verify:verify`, {
    address: deployedExchangeContract.address,
    constructorArguments: [token1Address],
  });
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
