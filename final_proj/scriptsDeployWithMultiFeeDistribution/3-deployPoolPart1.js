/*
This script deploys pool related smart contracts - Part 1.
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

  //   //

  //   /* n. Deploy WETHGateway */

  //   //

  //   console.log("\n1. Deploying WETHGateway...\n");
  //   const WETHGatewayFactory = await ethers.getContractFactory(
  //     "WrappedTokenGatewayV3"
  //   );
  //   const WETHGateway = await WETHGatewayFactory.deploy();
  //   await WETHGateway.deployed();
  //   console.log(
  //     `Successfully deployed @WETHGateway at address: ${WETHGateway.address} `
  //   );

  //   deploymentLog += `\nWETHGateway: \"${WETHGateway.address}\",\n`;

  //   /* Display deployed smart contracts */
  //   console.log(deploymentLog);

  //

  /* 1. Deploy WalletBalanceProvider */

  //

  console.log("\n1. Deploying WalletBalanceProvider...\n");
  const WalletBalanceProviderFactory = await ethers.getContractFactory(
    "WalletBalanceProvider"
  );
  const WalletBalanceProvider = await WalletBalanceProviderFactory.deploy();
  await WalletBalanceProvider.deployed();
  console.log(
    `Successfully deployed @WalletBalanceProvider at address: ${WalletBalanceProvider.address} `
  );

  deploymentLog += `\nWalletBalanceProvider: \"${WalletBalanceProvider.address}\",\n`;

  //

  /* 2. Deploy UiIncentiveDataProvider */

  //

  console.log("\n2. Deploying UiIncentiveDataProvider...\n");
  const UiIncentiveDataProviderFactory = await ethers.getContractFactory(
    "UiIncentiveDataProviderV3"
  );
  const UiIncentiveDataProvider = await UiIncentiveDataProviderFactory.deploy();
  await UiIncentiveDataProvider.deployed();
  console.log(
    `Successfully deployed @UiIncentiveDataProvider at address: ${UiIncentiveDataProvider.address} `
  );

  deploymentLog += `\nUiIncentiveDataProvider: \"${UiIncentiveDataProvider.address}\",\n`;

  /* Display deployed smart contracts */
  console.log(deploymentLog);

  //

  /* 3. Deploy UiPoolDataProvider */

  //

  console.log("\n3. Deploying UiPoolDataProvider...\n");
  const UiPoolDataProviderFactory = await ethers.getContractFactory(
    "UiPoolDataProviderV3"
  );
  const UiPoolDataProvider = await UiPoolDataProviderFactory.deploy(
    networkBaseCurrency.nativeCoinOracle,
    networkBaseCurrency.ETHOracle
  );
  await UiPoolDataProvider.deployed();
  console.log(
    `Successfully deployed @UiPoolDataProvider at address: ${UiPoolDataProvider.address} `
  );

  deploymentLog += `\nUiPoolDataProvider: \"${UiPoolDataProvider.address}\",\n`;

  //

  /* 4. Deploy PoolAddressesProvider */

  //

  console.log("\n4. Deploying PoolAddressesProvider...\n");
  const PoolAddressesProviderFactory = await ethers.getContractFactory(
    "PoolAddressesProvider"
  );
  const PoolAddressesProvider = await PoolAddressesProviderFactory.deploy(
    marketName,
    await signer.getAddress()
  );
  await PoolAddressesProvider.deployed();
  console.log(
    `Successfully deployed @PoolAddressesProvider at address: ${PoolAddressesProvider.address} `
  );

  deploymentLog += `\nPoolAddressesProvider: \"${PoolAddressesProvider.address}\",\n`;

  //

  /* 5. Register PoolAddressesProvider on PoolAddressesProviderRegistry */

  //

  console.log(
    "\n5. Registering PoolAddressesProvider on PoolAddressesProviderRegistry...\n"
  );

  const PoolAddressesProviderRegistry = new ethers.Contract(
    contractAddresses.PoolAddressesProviderRegistry,
    abi.PoolAddressesProviderRegistry,
    signer
  );

  await PoolAddressesProviderRegistry.registerAddressesProvider(
    PoolAddressesProvider.address,
    1n
  );

  console.log(
    "\nSuccessfully register PoolAddressesProvider on PoolAddressesProviderRegistry\n"
  );

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
    await WalletBalanceProvider.deployTransaction.wait(6);
    await verify(WalletBalanceProvider.address, []);

    await UiIncentiveDataProvider.deployTransaction.wait(6);
    await verify(UiIncentiveDataProvider.address, []);

    await UiPoolDataProvider.deployTransaction.wait(6);
    await verify(UiPoolDataProvider.address, [
      networkBaseCurrency.nativeCoinOracle,
      networkBaseCurrency.ETHOracle,
    ]);

    await PoolAddressesProvider.deployTransaction.wait(6);
    await verify(PoolAddressesProvider.address, [
      marketName,
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
