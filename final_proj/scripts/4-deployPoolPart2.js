/*
This script deploys pool related smart contracts - Part 2.
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
  console.log(`ChainId is ${currentChainID}`);

  //

  /* 1. Deploy AaveProtocolDataProvider */

  //

  console.log("\n1. Deploying AaveProtocolDataProvider...\n");
  const AaveProtocolDataProviderFactory = await ethers.getContractFactory(
    "contracts/core/misc/AaveProtocolDataProvider.sol:AaveProtocolDataProvider"
  );
  const AaveProtocolDataProvider = await AaveProtocolDataProviderFactory.deploy(
    contractAddresses.PoolAddressesProvider
  );
  await AaveProtocolDataProvider.deployed();
  console.log(
    `Successfully deployed @AaveProtocolDataProvider at address: ${AaveProtocolDataProvider.address} `
  );

  deploymentLog += `\nAaveProtocolDataProvider: \"${AaveProtocolDataProvider.address}\",\n`;

  //

  /* 2. Register AaveProtocolDataProvider on PoolAddressesProvider */

  //

  console.log(
    "\n2. Registering AaveProtocolDataProvider on PoolAddressesProvider...\n"
  );

  const PoolAddressesProvider = new ethers.Contract(
    contractAddresses.PoolAddressesProvider,
    abi.PoolAddressesProvider,
    signer
  );

  await PoolAddressesProvider.setPoolDataProvider(
    AaveProtocolDataProvider.address
  );
  console.log(
    "\nSuccessfully set ProtocolDataProvider on PoolAddressesProvider\n"
  );

  //

  /* 3. Deploy Pool Implementation*/

  //

  console.log("\n3. Deploying Pool Implementation...\n");
  const PoolImplementationFactory = await ethers.getContractFactory("Pool", {
    libraries: {
      BorrowLogic: contractAddresses.BorrowLogic,
      BridgeLogic: contractAddresses.BridgeLogic,
      EModeLogic: contractAddresses.EModeLogic,
      FlashLoanLogic: contractAddresses.FlashLoanLogic,
      LiquidationLogic: contractAddresses.LiquidationLogic,
      PoolLogic: contractAddresses.PoolLogic,
      SupplyLogic: contractAddresses.SupplyLogic,
    },
  });
  const PoolImplementation = await PoolImplementationFactory.deploy(
    contractAddresses.PoolAddressesProvider
  );
  await PoolImplementation.deployed();
  console.log(
    `Successfully deployed @PoolImplementation at address: ${PoolImplementation.address} `
  );

  deploymentLog += `\nPoolImplementation: \"${PoolImplementation.address}\",\n`;

  //

  /* 4. Deploy PoolConfigurator Implementation */

  //

  console.log("\n4. Deploying PoolConfigurator Implementation...\n");
  const PoolConfiguratorImplementationFactory = await ethers.getContractFactory(
    "PoolConfigurator",
    { libraries: { ConfiguratorLogic: contractAddresses.ConfiguratorLogic } }
  );
  const PoolConfiguratorImplementation =
    await PoolConfiguratorImplementationFactory.deploy();
  await PoolConfiguratorImplementation.deployed();
  console.log(
    `Successfully deployed @PoolConfiguratorImplementation at address: ${PoolConfiguratorImplementation.address} `
  );

  deploymentLog += `\nPoolConfiguratorImplementation: \"${PoolConfiguratorImplementation.address}\",\n`;

  //

  /* 5. Deploy ReservesSetupHelper */

  //

  console.log("\n5. Deploying ReservesSetupHelper...\n");
  const ReservesSetupHelperFactory = await ethers.getContractFactory(
    "ReservesSetupHelper"
  );
  const ReservesSetupHelper = await ReservesSetupHelperFactory.deploy();
  await ReservesSetupHelper.deployed();
  console.log(
    `Successfully deployed @ReservesSetupHelper at address: ${ReservesSetupHelper.address} `
  );

  deploymentLog += `\nReservesSetupHelper: \"${ReservesSetupHelper.address}\",\n`;

  //

  /* 6. Set ACLAdmin on PoolAddressesProvider */

  //

  console.log("\n6. Setting ACLAdmin on PoolAddressesProvider...\n");

  await PoolAddressesProvider.setACLAdmin(await signer.getAddress());
  console.log("\nSuccessfully set ACLAdmin on PoolAddressesProvider\n");

  //

  //

  /* 7. Deploy ACLManager */

  //

  console.log("\n7. Deploying ACLManager...\n");
  const ACLManagerFactory = await ethers.getContractFactory("ACLManager");
  const ACLManager = await ACLManagerFactory.deploy(
    contractAddresses.PoolAddressesProvider,
    { gasLimit: 5000000 }
  );
  await ACLManager.deployed();
  console.log(
    `Successfully deployed @ACLManager at address: ${ACLManager.address} `
  );

  deploymentLog += `\nACLManager: \"${ACLManager.address}\",\n`;

  //

  /* 8. Set ACLManager on PoolAddressesProvider */

  //

  console.log("\n8. Setting ACLManager on PoolAddressesProvider...\n");

  await PoolAddressesProvider.setACLManager(ACLManager.address);
  console.log("\nSuccessfully set ACLManager on PoolAddressesProvider\n");

  //

  /* 9. Add PoolAdmin, EmergencyAdmin, AssetListingAdmin on ACLManager */

  //

  console.log(
    "\n9. Adding PoolAdmin, EmergencyAdmin, AssetListingAdmin on ACLManager...\n"
  );
  await ACLManager.addPoolAdmin(await signer.getAddress());
  await ACLManager.addEmergencyAdmin(await signer.getAddress());
  await ACLManager.addAssetListingAdmin(await signer.getAddress());
  console.log(
    "\nSuccessfully added PoolAdmin, EmergencyAdmin, AssetListingAdmin on ACLManager\n"
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
    await AaveProtocolDataProvider.deployTransaction.wait(6);
    await verify(AaveProtocolDataProvider.address, [
      contractAddresses.PoolAddressesProvider,
    ]);

    await PoolImplementation.deployTransaction.wait(6);
    await verify(PoolImplementation.address, [
      contractAddresses.PoolAddressesProvider,
    ]);

    await PoolConfiguratorImplementation.deployTransaction.wait(6);
    await verify(PoolConfiguratorImplementation.address, []);

    await ReservesSetupHelper.deployTransaction.wait(6);
    await verify(ReservesSetupHelper.address, []);

    await ACLManager.deployTransaction.wait(6);
    await verify(ACLManager.address, [contractAddresses.PoolAddressesProvider]);
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
