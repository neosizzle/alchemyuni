/*
This script shuffles the deposit and borrowing of the LendingPool into a random state
*/
/********************/
/* Development Environment & Utilities */
/********************/
const hre = require("hardhat");
const { getContractAddress } = require("ethers/lib/utils");
const { ethers, run, network } = require("hardhat");
const {
  Contract,
} = require("hardhat/internal/hardhat-network/stack-traces/model.js");
const fs = require("fs");
const provider = ethers.provider;
const signer = ethers.provider.getSigner();
const currentChainID = network.config.chainID || network.config.chainId;

/********************/
/* Import Functions */
/********************/
const verify = require("./functions/verify.js");
const isSupportedNetwork = require("./functions/isSupportedNetwork.js");

/********************/
/* Import Information */
/********************/
const contractAddresses = require("./information/contractAddresses.js");
const abi = require("./information/abi.js");
const mockTokensConfigurations = require("./configuration/mockTokensConfiguration.js");
const supportedAssetsAndOracles = require("./configuration/supportedAssetsAndOracles.js");

let supportedAssets = [];
let supportedAssetsOracles = [];
for (let i = 0; i < supportedAssetsAndOracles.length; i++) {
  supportedAssets.push(supportedAssetsAndOracles[i].assetAddress);
  supportedAssetsOracles.push(supportedAssetsAndOracles[i].oracleAddress);
}
let interestRateStrategiesConfiguration = require("./configuration/interestRateStrategiesConfiguration.js");
let initReservesInputConfiguration = require("./configuration/initReservesInput.js");
let configureReservesInput = require("./configuration/configureReservesInput.js");
let eModes = require("./configuration/eModes.js");

/********************/
/* Constants & Variables */
/********************/
const GWEI = 10n ** 9n;
const ETHER = 10n ** 18n;

const DAY = 86400;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const zeroAddress = "0x0000000000000000000000000000000000000000";

/********************/
/* Configuration */
/********************/
const protocolOwner = require("./configuration/protocolOwner.js");
const networkBaseCurrency = require("./configuration/networkBaseCurrency.js");
const marketName = require("./configuration/marketName.js");
const { Pool } = require("./information/abi.js");

/********************/
/* Main Function */
/********************/
async function main() {
  let deploymentLog = `\nDeployed contract addresses:\n`;

  /* Display deployer's address and balance */
  console.log(`\nDeployer is ${await signer.getAddress()}\n`);
  console.log(
    `\nDeployer's wallet balance = ${await provider.getBalance(
      await signer.getAddress()
    )}\n`
  );
  console.log(`ChainId is ${currentChainID}`);

  const toApprove = true;
  const toSupply = true;
  const toBorrow = true;

  const PoolAddressesProvider = new ethers.Contract(
    contractAddresses.PoolAddressesProvider,
    abi.PoolAddressesProvider,
    signer
  );

  const AaveProtocolDataProvider = new ethers.Contract(
    contractAddresses.AaveProtocolDataProvider,
    abi.AaveProtocolDataProvider,
    signer
  );

  const PoolAddress = await PoolAddressesProvider.getPool();

  const Pool = new ethers.Contract(PoolAddress, abi.Pool, signer);

  const reservesList = await Pool.getReservesList();

  for (let i = 0; i < reservesList.length; i++) {
    const Token = new ethers.Contract(reservesList[i], abi.MockToken, signer);

    let approvalTx = await Token.approve(
      Pool.address,
      ethers.constants.MaxUint256
    );

    await approvalTx.wait(1);

    const balanceOfSigner = await Token.balanceOf(await signer.getAddress());
    console.log(balanceOfSigner);
    // Supply
    if (toSupply) {
      if (balanceOfSigner != 0n) {
        const randomNum = Math.floor(Math.random() * 10000);
        const balanceToSupply = BigInt(
          Math.floor(balanceOfSigner.mul(randomNum).div(10000))
        );
        console.log(balanceToSupply);

        let supplyTx = await Pool.supply(
          reservesList[i],
          balanceToSupply,
          await signer.getAddress(),
          0
        );
        await supplyTx.wait(1);
        console.log(`Deposited ${await Token.symbol()}`);
      }
    }
    const aTokenAddress = (
      await AaveProtocolDataProvider.getReserveTokensAddresses(reservesList[i])
    )[0];

    const reserveBalance = await Token.balanceOf(aTokenAddress);
    console.log(reserveBalance);

    if (toBorrow) {
      if (reserveBalance != 0n) {
        const randomNum = Math.floor(Math.random() * 10000);
        const amountToBorrow = BigInt(
          Math.floor(reserveBalance.mul(randomNum).div(10000).div(2))
        );
        console.log(`Amount to borrow: ${amountToBorrow}`);
        let borrowTx = await Pool.borrow(
          reservesList[i],
          amountToBorrow,
          2,
          0,
          await signer.getAddress(),
          { gasLimit: 1000000 }
        );
        await borrowTx.wait(1);
        console.log(`Borrowed ${await Token.symbol()}`);
      }
    }
  }

  /* Verify Smart Contract via Etherscan API */

  if (isSupportedNetwork(currentChainID)) {
  } else {
    console.log(
      "\nNetwork does not support Etherscan API auto verification.\n"
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
