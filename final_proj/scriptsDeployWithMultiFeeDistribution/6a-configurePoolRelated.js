/*
This script configures Pool Implementation & Related Smart Contracts
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

  //

  /* 1. Set PoolImpl and PoolConfiguratorImpl on PoolAddressesProvider */

  //

  console.log(
    "\n1. Setting PoolImpl and PoolConfiguratorImpl on PoolAddressesProvider...\n"
  );

  /* Recreate PoolAddressesProvider Instance */
  const PoolAddressesProvider = new ethers.Contract(
    contractAddresses.PoolAddressesProvider,
    abi.PoolAddressesProvider,
    signer
  );

  let tx;

  tx = await PoolAddressesProvider.setPoolImpl(
    contractAddresses.PoolImplementation,
    { gasLimit: 1000000 }
  );
  await tx.wait(6);

  tx = await PoolAddressesProvider.setPoolConfiguratorImpl(
    contractAddresses.PoolConfiguratorImplementation,
    { gasLimit: 1000000 }
  );
  await tx.wait(6);

  console.log(
    `\nSuccessfully set PoolImpl and PoolConfiguratorImpl on PoolAddressesProvider\n`
  );

  deploymentLog += `\nPoolProxy: \"${await PoolAddressesProvider.getPool()}\",\n`;
  deploymentLog += `PoolConfiguratorProxy: \"${await PoolAddressesProvider.getPoolConfigurator()}\",\n`;

  //

  /* Display deployed smart contracts */

  console.log(deploymentLog);

  /* Write deployed smart contracts */
  fs.appendFile(
    "./scripts/information/contractAddresses.txt",
    deploymentLog,
    function (err) {
      if (err) throw err;
      console.log("Written Deployment Log!");
    }
  );

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
