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
  /* Deploy mock tokens */
  console.log("\nDeploying mock tokens...\n");
  for (let i = 0; i < mockTokensConfiguration.length; i++) {
    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const MockToken = await MockTokenFactory.deploy(
      mockTokensConfiguration[i].name,
      mockTokensConfiguration[i].ticker,
      mockTokensConfiguration[i].supply
    );
    await MockToken.deployed();
    console.log(
      `\nSuccessfully deployed ${mockTokensConfiguration[i].ticker} at address: ${MockToken.address}\n`
    );
    if (isSupportedNetwork(currentChainID)) {
      await MockToken.deployTransaction.wait(6);
      await verify(MockToken.address, [
        mockTokensConfiguration[i].name,
        mockTokensConfiguration[i].ticker,
        mockTokensConfiguration[i].supply,
      ]);
    } else {
      console.log(
        "\nNetwork does not support Etherscan API auto verification.\n"
      );
    }
    deploymentLog += `\n${mockTokensConfiguration[i].ticker}: \"${MockToken.address}\",\n`;
    deploymentLog += `\n${mockTokensConfiguration[i].ticker}Oracle: \"${mockTokensConfiguration[i].oracle}\",\n`;
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
