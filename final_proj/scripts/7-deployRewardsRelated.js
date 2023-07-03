/*
This script deploys and configures Rewards related smart contracts
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

  /* 1. Deploy RewardsControllerProxy */

  //

  console.log("\n1. Deploying RewardsControllerProxy...\n");
  const RewardsControllerProxyFactory = await ethers.getContractFactory(
    "InitializableAdminUpgradeabilityProxy"
  );
  const RewardsControllerProxy = await RewardsControllerProxyFactory.deploy();
  await RewardsControllerProxy.deployed();
  console.log(
    `Successfully deployed @RewardsControllerProxy at address: ${RewardsControllerProxy.address} `
  );

  deploymentLog += `\nRewardsControllerProxy: \"${RewardsControllerProxy.address}\",\n`;

  //

  /* 2. Deploy RewardsController */

  //

  console.log("\n2. Deploying RewardsController...\n");
  const RewardsControllerFactory = await ethers.getContractFactory(
    "RewardsController"
  );
  const RewardsController = await RewardsControllerFactory.deploy(
    await signer.getAddress()
  );
  await RewardsController.deployed();
  console.log(
    `Successfully deployed @RewardsController at address: ${RewardsController.address} `
  );

  deploymentLog += `\nRewardsController: \"${RewardsController.address}\",\n`;

  //

  /* 3. Initialize RewardsController */

  //

  console.log("\n3. Initializing RewardsController...\n");

  await RewardsController.initialize(await signer.getAddress());
  console.log(`\nSuccessfully initialized RewardsController\n`);

  //

  /* 4. Initialize RewardsControllerProxy */

  //

  console.log("\n4. Initializing RewardsControllerProxy...\n");

  await RewardsControllerProxy["initialize(address,address,bytes)"](
    RewardsController.address,
    protocolOwner,
    "0x"
  );
  console.log("\nSuccessfully initialized RewardsControllerProxy\n");

  //

  /* 5. Initialize PullRewardsTransferStrategy */

  //

  console.log("\n5. Deploying PullRewardsTransferStrategy...\n");
  const PullRewardsTransferStrategyFactory = await ethers.getContractFactory(
    "PullRewardsTransferStrategy"
  );
  const PullRewardsTransferStrategy =
    await PullRewardsTransferStrategyFactory.deploy(
      RewardsControllerProxy.address,
      await signer.getAddress(),
      await signer.getAddress()
    );
  await PullRewardsTransferStrategy.deployed();
  console.log(
    `Successfully deployed @PullRewardsTransferStrategy at address: ${PullRewardsTransferStrategy.address} `
  );

  deploymentLog += `\nPullRewardsTransferStrategy: \"${PullRewardsTransferStrategy.address}\",\n`;

  //   const RewardsControllerProxyInstance = new ethers.Contract(
  //     RewardsControllerProxy.address,
  //     abi.RewardsController,
  //     signer
  //   );

  //   console.log(RewardsController.functions);

  //   await RewardsController.initialize(await signer.getAddress());

  //   await RewardsControllerProxyInstance["initialize()"]();

  //   await RewardsController.initialize(await signer.getAddress());
  //   console.log(`\nSuccessfully initialized RewardsController\n`);

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
    await RewardsControllerProxy.deployTransaction.wait(6);
    await verify(RewardsControllerProxy.address, []);

    await RewardsController.deployTransaction.wait(6);
    await verify(RewardsController.address, [await signer.getAddress()]);

    await PullRewardsTransferStrategy.deployTransaction.wait(6);
    await verify(PullRewardsTransferStrategy.address, [
      RewardsControllerProxy.address,
      await signer.getAddress(),
      await signer.getAddress(),
    ]);
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
