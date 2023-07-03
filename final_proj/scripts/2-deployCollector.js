/*
This script deploys collector related smart contracts.
Skip this script if deployer were to use a differnt funds collection method.
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
const protocolOwner = require("./configuration/protocolOwner.js");

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

  //

  /* 1. Deploy InitializableAdminUpgradeabilityProxy as TreasuryProxy */

  //

  console.log("\n1. Deploying TreasuryProxy...\n");
  const TreasuryProxyFactory = await ethers.getContractFactory(
    "InitializableAdminUpgradeabilityProxy"
  );
  const TreasuryProxy = await TreasuryProxyFactory.deploy();
  await TreasuryProxy.deployed();
  console.log(
    `Successfully deployed @TreasuryProxy at address: ${TreasuryProxy.address} `
  );

  deploymentLog += `\nTreasury: \"${TreasuryProxy.address}\",\n`;

  //

  /* 2. Deploy CollectorController */

  //

  console.log("\n2. Deploying CollectorController...\n");
  const CollectorControllerFactory = await ethers.getContractFactory(
    "CollectorController"
  );
  const CollectorController = await CollectorControllerFactory.deploy(
    protocolOwner
  );
  await CollectorController.deployed();
  console.log(
    `Successfully deployed @CollectorController at address: ${CollectorController.address} `
  );

  deploymentLog += `\nCollectorController: \"${CollectorController.address}\",\n`;

  //

  /* 3. Deploy Collector */

  //

  console.log("\n3. Deploying Collector...\n");
  const CollectorFactory = await ethers.getContractFactory("Collector");
  const Collector = await CollectorFactory.deploy();
  await Collector.deployed();
  console.log(
    `Successfully deployed @Collector at address: ${Collector.address} `
  );

  deploymentLog += `\nCollector: \"${Collector.address}\",\n`;

  //

  /* 4. Initialize() Collector */

  //

  console.log("\n4. Initialize() Collector...\n");
  await Collector.initialize(zeroAddress, {
    gasLimit: 200000,
  });
  const fundsAdmin = await Collector.getFundsAdmin();
  if (fundsAdmin === zeroAddress)
    console.log("Successfully initialized Collector smart contract");

  //

  /* 5. Initialize() TreasuryProxy */

  //

  console.log("\n5. Initialize() TreasuryProxy...\n");

  await TreasuryProxy["initialize(address,address,bytes)"](
    Collector.address,
    protocolOwner,
    "0x"
  );

  const Treasury = new ethers.Contract(
    TreasuryProxy.address,
    abi.Collector,
    signer
  );

  await Treasury.initialize(CollectorController.address, { gasLimit: 200000 });

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
    await TreasuryProxy.deployTransaction.wait(6);
    await verify(TreasuryProxy.address, []);

    await CollectorController.deployTransaction.wait(6);
    await verify(CollectorController.address, [protocolOwner]);

    await Collector.deployTransaction.wait(6);
    await verify(Collector.address, []);
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
