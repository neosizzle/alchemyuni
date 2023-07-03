/*
This script deploys different interest rate strategies.
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

  /* 1. Deploy DefaultReserveInterestRateStrategy */

  //

  for (let i = 0; i < interestRateStrategiesConfiguration.length; i++) {
    console.log(
      "\n1. Deploying DefaultReserveInterestRateStrategy Contracts...\n"
    );
    const InterestStrategyFactory = await ethers.getContractFactory(
      "contracts/core/protocol/pool/DefaultReserveInterestRateStrategy.sol:DefaultReserveInterestRateStrategy"
    );
    const InterestStrategy = await InterestStrategyFactory.deploy(
      contractAddresses.PoolProxy,
      interestRateStrategiesConfiguration[i].optimalUsageRatio,
      interestRateStrategiesConfiguration[i].baseVariableBorrowRate,
      interestRateStrategiesConfiguration[i].variableRateSlope1,
      interestRateStrategiesConfiguration[i].variableRateSlope2,
      interestRateStrategiesConfiguration[i].stableRateSlope1,
      interestRateStrategiesConfiguration[i].stableRateSlope2,
      interestRateStrategiesConfiguration[i].baseStableRateOffset,
      interestRateStrategiesConfiguration[i].stableRateExcessOffset,
      interestRateStrategiesConfiguration[i].optimalStableToTotalDebtRatio
    );
    await InterestStrategy.deployed();
    console.log(
      `Successfully deployed @${interestRateStrategiesConfiguration[i].strategyName}Strategy at address: ${InterestStrategy.address} `
    );

    deploymentLog += `\n${interestRateStrategiesConfiguration[i].strategyName}Strategy: \"${InterestStrategy.address}\",\n`;

    /* Verify Smart Contract via Etherscan API */

    if (isSupportedNetwork(currentChainID)) {
      await InterestStrategy.deployTransaction.wait(10);
      await verify(InterestStrategy.address, [
        contractAddresses.PoolProxy,
        interestRateStrategiesConfiguration[i].optimalUsageRatio,
        interestRateStrategiesConfiguration[i].baseVariableBorrowRate,
        interestRateStrategiesConfiguration[i].variableRateSlope1,
        interestRateStrategiesConfiguration[i].variableRateSlope2,
        interestRateStrategiesConfiguration[i].stableRateSlope1,
        interestRateStrategiesConfiguration[i].stableRateSlope2,
        interestRateStrategiesConfiguration[i].baseStableRateOffset,
        interestRateStrategiesConfiguration[i].stableRateExcessOffset,
        interestRateStrategiesConfiguration[i].optimalStableToTotalDebtRatio,
      ]);
    } else {
      console.log(
        "\nNetwork does not support Etherscan API auto verification.\n"
      );
    }
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
