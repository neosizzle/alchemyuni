/*
Misc script to deploy spontaneous contracts
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
let initReservesInputConfiguration = require("./configuration/initReservesInput.js");
let configureReservesInput = require("./configuration/configureReservesInput.js");
let eModes = require("./configuration/eModes.js");

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
const maxBigInt =
  0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

/********************/
/* Configuration */
/********************/
const mockTokensConfiguration = require("./configuration/mockTokensConfiguration.js");
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

  const UiIncentiveDataProviderAdapterFactory = await ethers.getContractFactory(
    "UiIncentiveDataProviderAdapter"
  );
  const UiIncentiveDataProviderAdapter =
    await UiIncentiveDataProviderAdapterFactory.deploy();
  await UiIncentiveDataProviderAdapter.deployed();
  console.log(
    `Successfully deployed @UiIncentiveDataProviderAdapter at address: ${UiIncentiveDataProviderAdapter.address} `
  );

  deploymentLog += `\nUiIncentiveDataProviderAdapter: \"${UiIncentiveDataProviderAdapter.address}\",\n`;

  // const PoolAddressesProvider = new ethers.Contract(
  //   contractAddresses.PoolAddressesProvider,
  //   abi.PoolAddressesProvider,
  //   signer
  // );

  // let tx = await PoolAddressesProvider.setPoolConfiguratorImpl(
  //   "0xAab512e773f28E2f872455c7a73B6184bAb64345",
  //   { gasLimit: 500000 }
  // );
  // let tx = await PoolAddressesProvider.setAddressAsProxy(
  //   "0x504f4f4c5f434f4e464947555241544f52000000000000000000000000000000",
  //   "0xAab512e773f28E2f872455c7a73B6184bAb64345"
  // );
  // await tx.wait(3);

  // const PoolConfiguratorFactory = await ethers.getContractFactory(
  //   "PoolConfigurator",
  //   { libraries: { ConfiguratorLogic: contractAddresses.ConfiguratorLogic } }
  // );
  // const PoolConfigurator = await PoolConfiguratorFactory.deploy();
  // await PoolConfigurator.deployed();
  // console.log(
  //   `Successfully deployed @PoolConfigurator at address: ${PoolConfigurator.address} `
  // );

  // deploymentLog += `\nPoolConfigurator: \"${PoolConfigurator.address}\",\n`;

  // //

  // /* 1. Deployment Task */

  // //

  // console.log("\n1. Deploying UiPoolDataProviderV3Amended...\n");
  // const UiPoolDataProviderV3AmendedFactory = await ethers.getContractFactory(
  //   "UiPoolDataProviderV3Amended"
  // );
  // const UiPoolDataProviderV3Amended =
  //   await UiPoolDataProviderV3AmendedFactory.deploy(
  //     networkBaseCurrency.nativeCoinOracle,
  //     networkBaseCurrency.ETHOracle
  //   );
  // await UiPoolDataProviderV3Amended.deployed();
  // console.log(
  //   `Successfully deployed @UiPoolDataProviderV3Amended at address: ${UiPoolDataProviderV3Amended.address} `
  // );

  // deploymentLog += `\nUiPoolDataProviderV3Amended: \"${UiPoolDataProviderV3Amended.address}\",\n`;

  // /* Display deployed smart contracts */
  // console.log(deploymentLog);

  //

  // /* 2. Function task */

  //

  // for (let i = 0; i < supportedAssets.length; i++) {
  //   const mockToken = new ethers.Contract(
  //     supportedAssets[i],
  //     abi.MockToken,
  //     signer
  //   );
  //   let tokenBalance = await mockToken.balanceOf(await signer.getAddress());
  //   let tokenToTransfer = tokenBalance.div(4n);
  //   let tx = await mockToken.transfer(
  //     "0xA0f5a89f1dcD594104a88c7586ec5BeB5a52651b", //Jun Han's address
  //     tokenToTransfer
  //   );
  //   await tx.wait(3);
  //   console.log(`Transfered ${await mockToken.name()}`);
  // }
  // const LendingPool = new ethers.Contract(
  //   contractAddresses.PoolProxy,
  //   abi.Pool,
  //   signer
  // );

  // for (let i = 0; i < supportedAssets.length; i++) {
  //   const mockToken = new ethers.Contract(
  //     supportedAssets[i],
  //     abi.MockToken,
  //     signer
  //   );
  //   let approvalTx = await mockToken.approve(
  //     contractAddresses.PoolProxy,
  //     maxBigInt
  //   );
  //   console.log(`Approved LendingPool to spend ${await mockToken.name()}`);
  //   await approvalTx.wait(1);

  //   let tokensAmountToSupply = (
  //     await mockToken.balanceOf(await signer.getAddress())
  //   ).div(Math.ceil(Math.random() * 100));
  //   console.log(tokensAmountToSupply);
  //   if ((await mockToken.symbol()) !== "WtBNB") {
  //     let supplyTx = await LendingPool.supply(
  //       supportedAssets[i],
  //       tokensAmountToSupply,
  //       await signer.getAddress(),
  //       0
  //     );
  //     console.log(`Supplied ${await mockToken.name()} to LendingPool`);
  //     await supplyTx.wait(1);
  //   }
  // }

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
    await UiIncentiveDataProviderAdapter.deployTransaction.wait(6);
    await verify(UiIncentiveDataProviderAdapter.address, []);
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
