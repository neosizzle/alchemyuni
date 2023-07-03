/*
This script deploys ATokens and WETHGateway.
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
const bit256Max = 0xffffffffffffffffffffffffffffffffffffffffn;

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

  // const PoolAddressesProvider = new ethers.Contract(
  //   contractAddresses.PoolAddressesProvider,
  //   abi.PoolAddressesProvider,
  //   signer
  // );

  // console.log(`PoolProxy: \"${await PoolAddressesProvider.getPool()}\"`);
  // console.log(
  //   `PoolConfiguratorProxy: \"${await PoolAddressesProvider.getPoolConfigurator()}\"`
  // );

  //

  /* 1. Deploy AToken */

  //

  console.log("\n1. Deploying AToken...\n");
  const ATokenFactory = await ethers.getContractFactory("AToken");
  const AToken = await ATokenFactory.deploy(contractAddresses.PoolProxy);
  await AToken.deployed();
  console.log(`Successfully deployed @AToken at address: ${AToken.address} `);

  deploymentLog += `\nAToken: \"${AToken.address}\",\n`;

  //

  /* 2. Deploy DelegationAwareAToken */

  //

  console.log("\n2. Deploying DelegationAwareAToken...\n");
  const DelegationAwareATokenFactory = await ethers.getContractFactory(
    "DelegationAwareAToken"
  );
  const DelegationAwareAToken = await DelegationAwareATokenFactory.deploy(
    contractAddresses.PoolProxy
  );
  await DelegationAwareAToken.deployed();
  console.log(
    `Successfully deployed @DelegationAwareAToken at address: ${DelegationAwareAToken.address} `
  );

  deploymentLog += `\nDelegationAwareAToken: \"${DelegationAwareAToken.address}\",\n`;

  //

  /* 3. Deploy StableDebtToken */

  //

  console.log("\n3. Deploying StableDebtToken...\n");
  const StableDebtTokenFactory = await ethers.getContractFactory(
    "StableDebtToken"
  );
  const StableDebtToken = await StableDebtTokenFactory.deploy(
    contractAddresses.PoolProxy
  );
  await StableDebtToken.deployed();
  console.log(
    `Successfully deployed @StableDebtToken at address: ${StableDebtToken.address} `
  );

  deploymentLog += `\nStableDebtToken: \"${StableDebtToken.address}\",\n`;

  //

  /* 4. Deploy VariableDebtToken */

  //

  console.log("\n4. Deploying VariableDebtToken...\n");
  const VariableDebtTokenFactory = await ethers.getContractFactory(
    "VariableDebtToken"
  );
  const VariableDebtToken = await VariableDebtTokenFactory.deploy(
    contractAddresses.PoolProxy
  );
  await VariableDebtToken.deployed();
  console.log(
    `Successfully deployed @VariableDebtToken at address: ${VariableDebtToken.address} `
  );

  deploymentLog += `\nVariableDebtToken: \"${VariableDebtToken.address}\",\n`;

  //

  /* 5. Deploy WETHGateway */

  //

  console.log("\n5. Deploying WETHGateway...\n");
  const WETHGatewayFactory = await ethers.getContractFactory(
    "WrappedTokenGatewayV3"
  );
  const WETHGateway = await WETHGatewayFactory.deploy(
    contractAddresses.WBNB,
    await signer.getAddress(),
    contractAddresses.PoolProxy
  );
  await WETHGateway.deployed();
  console.log(
    `Successfully deployed @WETHGateway at address: ${WETHGateway.address} `
  );

  deploymentLog += `\nWETHGateway: \"${WETHGateway.address}\",\n`;

  // /* Display deployed smart contracts */

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
    await AToken.deployTransaction.wait(6);
    await verify(AToken.address, [contractAddresses.PoolProxy]);

    await DelegationAwareAToken.deployTransaction.wait(6);
    await verify(DelegationAwareAToken.address, [contractAddresses.PoolProxy]);

    await StableDebtToken.deployTransaction.wait(6);
    await verify(StableDebtToken.address, [contractAddresses.PoolProxy]);

    await VariableDebtToken.deployTransaction.wait(6);
    await verify(VariableDebtToken.address, [contractAddresses.PoolProxy]);

    // await WETHGateway.deployTransaction.wait(6);
    // await verify(WETHGateway.address, [
    //   contractAddresses.NativeWrappedToken,
    //   await signer.getAddress(),
    //   contractAddresses.PoolProxy,
    // ]);
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
