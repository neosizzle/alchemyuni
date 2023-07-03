/*
This script deploys mock tokens on Testnet to as reserve assets.
Skip this sceript when deploying on real blockchain
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
const mockOracleConfiguration = require("./configuration/mockOracleConfiguration.js");

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
const mockTokensConfiguration = require("./configuration/mockTokensConfiguration.js");

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
  /* Deploy MockWeth */
  console.log("\n1. Deploying MockWeth9...\n");
  const MockWeth9Factory = await ethers.getContractFactory("MockWeth9");
  const MockWeth9 = await MockWeth9Factory.deploy();
  await MockWeth9.deployed();
  console.log(
    `\nSuccessfully deployed MockWeth9 at address: ${MockWeth9.address}\n`
  );
  deploymentLog += `\nWBNB: \"${MockWeth9.address}\",\n`;

  /* Deploy mock oracles */
  for (let i = 0; i < mockOracleConfiguration.length; i++) {
    console.log(
      `\n2. Deploying ${mockOracleConfiguration[i].ticker}Oracle...\n`
    );
    const MockOracleFactory = await ethers.getContractFactory("MockOracle");
    const MockOracle = await MockOracleFactory.deploy(
      mockOracleConfiguration[i].description,
      mockOracleConfiguration[i].ticker,
      mockOracleConfiguration[i].decimals,
      mockOracleConfiguration[i].latestAnswer
    );
    await MockOracle.deployed();
    console.log(
      `\nSuccessfully deployed ${await MockOracle.ticker()}Oracle at address: ${
        MockOracle.address
      }\n`
    );
    deploymentLog += `\n${await MockOracle.ticker()}Oracle: \"${
      MockOracle.address
    }\",\n`;
  }

  if (isSupportedNetwork(currentChainID)) {
  } else {
    console.log(
      "\nNetwork does not support Etherscan API auto verification.\n"
    );
  }

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
