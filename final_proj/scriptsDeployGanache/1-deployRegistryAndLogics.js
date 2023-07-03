/*
This script deploys PoolAddressesProviderRegistry and pool logic related smart contracts.
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

  //

  /* 1. Deploy PoolAddressesProviderRegistry */

  //

  console.log("\n1. Deploying PoolAddressesProviderRegistry...\n");
  const PoolAddressesProviderRegistryFactory = await ethers.getContractFactory(
    "PoolAddressesProviderRegistry"
  );
  const PoolAddressesProviderRegistry =
    await PoolAddressesProviderRegistryFactory.deploy(
      await signer.getAddress()
    );
  await PoolAddressesProviderRegistry.deployed();
  console.log(
    `Successfully deployed @LendingPoolAddressesProviderRegistry at address: ${PoolAddressesProviderRegistry.address} `
  );

  deploymentLog += `\nPoolAddressesProviderRegistry: \"${PoolAddressesProviderRegistry.address}\",\n`;

  // //

  // /* 2. Deploy SupplyLogic */

  // //

  console.log("\n2. Deploying SupplyLogic...\n");
  const SupplyLogicFactory = await ethers.getContractFactory("SupplyLogic");
  const SupplyLogic = await SupplyLogicFactory.deploy();
  await SupplyLogic.deployed();
  console.log(
    `Successfully deployed @SupplyLogic at address: ${SupplyLogic.address} `
  );

  deploymentLog += `\nSupplyLogic: \"${SupplyLogic.address}\",\n`;

  //

  /* 3. Deploy BorrowLogic */

  //

  console.log("\n3. Deploying BorrowLogic...\n");
  const BorrowLogicFactory = await ethers.getContractFactory("BorrowLogic");
  const BorrowLogic = await BorrowLogicFactory.deploy();
  await BorrowLogic.deployed();
  console.log(
    `Successfully deployed @BorrowLogic at address: ${BorrowLogic.address} `
  );

  deploymentLog += `\nBorrowLogic: \"${BorrowLogic.address}\",\n`;

  //

  /* 4. Deploy LiquidationLogic */

  //

  console.log("\n4. Deploying LiquidationLogic...\n");
  const LiquidationLogicFactory = await ethers.getContractFactory(
    "LiquidationLogic"
  );
  const LiquidationLogic = await LiquidationLogicFactory.deploy();
  await LiquidationLogic.deployed();
  console.log(
    `Successfully deployed @LiquidationLogic at address: ${LiquidationLogic.address} `
  );

  deploymentLog += `\nLiquidationLogic: \"${LiquidationLogic.address}\",\n`;

  //

  /* 5. Deploy EModeLogic */

  //

  console.log("\n5. Deploying EModeLogic...\n");
  const EModeLogicFactory = await ethers.getContractFactory("EModeLogic");
  const EModeLogic = await EModeLogicFactory.deploy();
  await EModeLogic.deployed();
  console.log(
    `Successfully deployed @EModeLogic at address: ${EModeLogic.address} `
  );

  deploymentLog += `\nEModeLogic: \"${EModeLogic.address}\",\n`;

  //

  /* 6. Deploy BridgeLogic */

  //

  console.log("\n6. Deploying BridgeLogic...\n");
  const BridgeLogicFactory = await ethers.getContractFactory("BridgeLogic");
  const BridgeLogic = await BridgeLogicFactory.deploy();
  await BridgeLogic.deployed();
  console.log(
    `Successfully deployed @BridgeLogic at address: ${BridgeLogic.address} `
  );

  deploymentLog += `\nBridgeLogic: \"${BridgeLogic.address}\",\n`;

  //

  /* 7. Deploy ConfiguratorLogic */

  //
  console.log("\n7. Deploying ConfiguratorLogic...\n");
  const ConfiguratorLogicFactory = await ethers.getContractFactory(
    "ConfiguratorLogic"
  );
  const ConfiguratorLogic = await ConfiguratorLogicFactory.deploy();
  await ConfiguratorLogic.deployed();
  console.log(
    `Successfully deployed @ConfiguratorLogic at address: ${ConfiguratorLogic.address} `
  );

  deploymentLog += `\nConfiguratorLogic: \"${ConfiguratorLogic.address}\",\n`;

  //

  /* 8. Deploy FlashLoanLogic */

  //
  console.log("\n8. Deploying FlashLoanLogic...\n");
  const FlashLoanLogicFactory = await ethers.getContractFactory(
    "FlashLoanLogic",
    {
      libraries: {
        BorrowLogic: BorrowLogic.address,
      },
    }
  );
  const FlashLoanLogic = await FlashLoanLogicFactory.deploy();
  await FlashLoanLogic.deployed();
  console.log(
    `Successfully deployed @FlashLoanLogic at address: ${FlashLoanLogic.address} `
  );

  deploymentLog += `\nFlashLoanLogic: \"${FlashLoanLogic.address}\",\n`;

  //

  /* 9. Deploy PoolLogic */

  //

  console.log("\n9. Deploying PoolLogic...\n");
  const PoolLogicFactory = await ethers.getContractFactory("PoolLogic");
  const PoolLogic = await PoolLogicFactory.deploy();
  await PoolLogic.deployed();
  console.log(
    `Successfully deployed @PoolLogic at address: ${PoolLogic.address} `
  );

  deploymentLog += `\nPoolLogic: \"${PoolLogic.address}\",\n`;

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
    await PoolAddressesProviderRegistry.deployTransaction.wait(6);
    await verify(PoolAddressesProviderRegistry.address, [
      await signer.getAddress(),
    ]);

    await SupplyLogic.deployTransaction.wait(6);
    await verify(SupplyLogic.address, []);

    await BorrowLogic.deployTransaction.wait(6);
    await verify(BorrowLogic.address, []);

    await LiquidationLogic.deployTransaction.wait(6);
    await verify(LiquidationLogic.address, []);

    await EModeLogic.deployTransaction.wait(6);
    await verify(EModeLogic.address, []);

    await BridgeLogic.deployTransaction.wait(6);
    await verify(BridgeLogic.address, []);

    await ConfiguratorLogic.deployTransaction.wait(6);
    await verify(ConfiguratorLogic.address, []);

    await FlashLoanLogic.deployTransaction.wait(6);
    await verify(FlashLoanLogic.address, []);

    await PoolLogic.deployTransaction.wait(6);
    await verify(PoolLogic.address, []);
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
