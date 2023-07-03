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

  /* 1. InitReserves() on PoolConfiguratorProxy */

  //

  console.log("\n1. InitReserves on PoolConfiguratorProxy...\n");

  const PoolConfiguratorProxy = new ethers.Contract(
    contractAddresses.PoolConfiguratorProxy,
    abi.PoolConfigurator,
    signer
  );

  let initReservesInputObjectArray = [];

  for (let i = 0; i < initReservesInputConfiguration.length; i++) {
    let InitReservesInputObject = {
      aTokenImpl: initReservesInputConfiguration[i].aToken,
      stableDebtTokenImpl: initReservesInputConfiguration[i].stableDebtToken,
      variableDebtTokenImpl:
        initReservesInputConfiguration[i].variableDebtToken,
      underlyingAssetDecimals: initReservesInputConfiguration[i].decimals,
      interestRateStrategyAddress:
        initReservesInputConfiguration[i].strategyAddress,
      underlyingAsset: initReservesInputConfiguration[i].underlyingAsset,
      treasury: initReservesInputConfiguration[i].treasury,
      incentivesController:
        initReservesInputConfiguration[i].incentivesController,
      aTokenName: `Maneki ${initReservesInputConfiguration[i].assetTicker}`,
      aTokenSymbol: `m${initReservesInputConfiguration[i].assetTicker}`,
      variableDebtTokenName: `Maneki Variable Debt ${initReservesInputConfiguration[i].assetTicker}`,
      variableDebtTokenSymbol: `variableDebtManeki${initReservesInputConfiguration[i].assetTicker}`,
      stableDebtTokenName: `Maneki Stable Debt ${initReservesInputConfiguration[i].assetTicker}`,
      stableDebtTokenSymbol: `stableDebtManeki${initReservesInputConfiguration[i].assetTicker}`,
      params: "0x",
    };

    initReservesInputObjectArray.push(InitReservesInputObject);
  }

  console.log(initReservesInputObjectArray);

  await PoolConfiguratorProxy.initReserves(initReservesInputObjectArray);

  console.log(`Successfully batch initReserves on PoolConfiguratorProxy`);

  //

  /* 2. addRiskAdmin() on ACLManager */

  //

  const ACLManager = new ethers.Contract(
    contractAddresses.ACLManager,
    abi.ACLManager,
    signer
  );

  await ACLManager.addRiskAdmin(contractAddresses.ReservesSetupHelper);

  console.log(
    "\nSuccessfully added ReservesSetupHelper as riskAdmin on ACLManager\n"
  );

  //

  /* 3. Configure reserves input with ReservesSetupHelper */

  //
  console.log(`\n3. Configuring reserves with ReservesSetupHelper\n`);

  const ReservesSetupHelper = new ethers.Contract(
    contractAddresses.ReservesSetupHelper,
    abi.ReservesSetupHelper,
    signer
  );

  let configureReservesInputArray = [];

  for (let i = 0; i < configureReservesInput.length; i++) {
    console.log(`Configuring ${configureReservesInput[i].name}...`);
    configureReservesInputArray.push(configureReservesInput[i].configure);
  }

  console.log(configureReservesInputArray);

  await ReservesSetupHelper.configureReserves(
    contractAddresses.PoolConfiguratorProxy,
    configureReservesInputArray
  );

  console.log(
    "\nSuccessfully configure reserves on PoolConfiguratorProxy with ReservesSetupHelper\n"
  );

  //

  /* 4. addRiskAdmin() on ACLManager */

  //

  await ACLManager.removeRiskAdmin(contractAddresses.ReservesSetupHelper);

  console.log(
    "\nSuccessfully removed ReservesSetupHelper as riskAdmin on ACLManager\n"
  );

  // // /* 5. Deploy ParaSwapLiquiditySwapAdapter */
  // // Not deployable to BSC Testnet

  // //

  // console.log("\n5. Deploying ParaSwapLiquiditySwapAdapter...\n");
  // const ParaSwapLiquiditySwapAdapterFactory = await ethers.getContractFactory(
  //   "ParaSwapLiquiditySwapAdapter"
  // );
  // const ParaSwapLiquiditySwapAdapter =
  //   await ParaSwapLiquiditySwapAdapterFactory.deploy(
  //     contractAddresses.PoolAddressesProvider,
  //     contractAddresses.ParaSwapAugustusRegistry,
  //     await signer.getAddress()
  //   );
  // await ParaSwapLiquiditySwapAdapter.deployed();
  // console.log(
  //   `Successfully deployed @ParaSwapLiquiditySwapAdapter at address: ${ParaSwapLiquiditySwapAdapter.address} `
  // );

  // deploymentLog += `\nParaSwapLiquiditySwapAdapter: \"${ParaSwapLiquiditySwapAdapter.address}\",\n`;

  // //

  // // /* 6. Deploy ParaSwapLiquiditySwapAdapter */
  // // Not deployable to BSC Testnet

  // //

  // console.log("\n6. Deploying ParaSwapRepayAdapter...\n");
  // const ParaSwapRepayAdapterFactory = await ethers.getContractFactory(
  //   "ParaSwapRepayAdapter"
  // );
  // const ParaSwapRepayAdapter = await ParaSwapRepayAdapterFactory.deploy(
  //   contractAddresses.PoolAddressesProvider,
  //   contractAddresses.ParaSwapAugustusRegistry,
  //   await signer.getAddress()
  // );
  // await ParaSwapRepayAdapter.deployed();
  // console.log(
  //   `Successfully deployed @ParaSwapRepayAdapter at address: ${ParaSwapRepayAdapter.address} `
  // );

  // deploymentLog += `\nParaSwapRepayAdapter: \"${ParaSwapRepayAdapter.address}\",\n`;

  //

  /* 7. setDebtCeiling() on PoolConfiguratorProxy */

  //

  console.log(`\n7. Setting debtCeiling for assets...\n`);

  for (let i = 0; i < configureReservesInput.length; i++) {
    if (configureReservesInput[i].setDebtCeiling === true) {
      await PoolConfiguratorProxy.setDebtCeiling(
        configureReservesInput[i].configure.asset,
        configureReservesInput[i].debtCeiling
      );
    }
  }

  console.log("\nSuccessfully set debt ceiling for assets\n");

  //

  /* 8. setBorrowableInIsolation() on PoolConfiguratorProxy */

  //

  console.log(`\n8. Setting borrawableInIsolation for assets...\n`);

  for (let i = 0; i < configureReservesInput.length; i++) {
    if (configureReservesInput[i].isBorrowableInIsolation === true) {
      await PoolConfiguratorProxy.setBorrowableInIsolation(
        configureReservesInput[i].configure.asset,
        true
      );
    }
  }

  console.log("\nSuccessfully set borrawableInIsolation celing for assets\n");

  //

  /* 9. setEModeCategory() on PoolConfiguratorProxy */

  //

  console.log(`\n9. Setting eModeCategory for assets...\n`);

  for (let i = 0; i < eModes.length; i++) {
    const cunrrentModeNumber = i + 1;
    await PoolConfiguratorProxy.setEModeCategory(
      cunrrentModeNumber,
      eModes[i].ltv,
      eModes[i].liquidationThreshold,
      eModes[i].liquidationBonus,
      zeroAddress,
      eModes[i].eModeName
    );
    for (let j = 0; j < eModes[i].assets.length; j++) {
      const tx = await PoolConfiguratorProxy.setAssetEModeCategory(
        eModes[i].assets[j],
        1n
      );
      await tx.wait(2);
    }
    console.log(eModes[i].assets[0]);
  }

  console.log(`\nSuccessfully set eModeCategories and assets\n`);

  //

  /* 10. setLiquidationProtocolFee() for assets */

  //

  console.log(`\n10. Setting liquidationProtocolFee for assets...\n`);

  for (let i = 0; i < configureReservesInput.length; i++) {
    const tx = await PoolConfiguratorProxy.setLiquidationProtocolFee(
      configureReservesInput[i].configure.asset,
      configureReservesInput[i].liquidationProtocolFee
    );
    await tx.wait(2);
  }

  console.log(`\nSuccessfully set liquidationProtocolFee for assets\n`);

  //

  /* 11. setIncentivesController() on all aTokens */

  //
  console.log(`\n11. Setting incentivesController on all aTokens\n`);
  const AaveProtocolDataProvider = new ethers.Contract(
    contractAddresses.AaveProtocolDataProvider,
    abi.AaveProtocolDataProvider,
    signer
  );
  let allATokenAddressesArray = [];
  let allVariableDebtTokenAddressesArray = [];
  let allStableDebtTokenAddressesArray = [];

  for (let i = 0; i < configureReservesInput.length; i++) {
    const reserveATokenAddresses =
      await AaveProtocolDataProvider.callStatic.getReserveTokensAddresses(
        configureReservesInput[i].configure.asset
      );
    console.log(reserveATokenAddresses);
    allATokenAddressesArray.push(reserveATokenAddresses.aTokenAddress);
    allVariableDebtTokenAddressesArray.push(
      reserveATokenAddresses.variableDebtTokenAddress
    );
    allStableDebtTokenAddressesArray.push(
      reserveATokenAddresses.stableDebtTokenAddress
    );
  }

  console.log(`All AToken Addresses: `);
  console.log(allATokenAddressesArray);

  console.log(`All Variable Debt Token Addresses Addresses: `);
  console.log(allVariableDebtTokenAddressesArray);

  console.log(`All Stable Debt Token Addresses Addresses: `);
  console.log(allStableDebtTokenAddressesArray);

  //

  /* 12. Add rewards to MultiFeeDistribution */

  //

  console.log(`\n12. Adding rewards to MultiFeeDistribution\n`);

  const MultiFeeDistribution = new ethers.Contract(
    contractAddresses.MultiFeeDistribution,
    abi.MultiFeeDistribution,
    signer
  );

  for (let i = 0; i < allATokenAddressesArray.length; i++) {
    tx = await MultiFeeDistribution.addReward(allATokenAddressesArray[i]);
    await tx.wait(2);
  }

  console.log(`\nDone adding rewards to MultiFeeDistribution\n`);

  //

  /* 13. Adding Pools to ChefInventivesController */

  //

  console.log(`\n13. Adding pools to ChefInventivesController\n`);

  const ChefIncentivesController = new ethers.Contract(
    contractAddresses.ChefIncentivesController,
    abi.ChefIncentivesController,
    signer
  );

  for (let i = 0; i < allATokenAddressesArray.length; i++) {
    tx = await ChefIncentivesController.addPool(
      allATokenAddressesArray[i],
      100n
    );
    await tx.wait(2);
  }

  for (let i = 0; i < allVariableDebtTokenAddressesArray.length; i++) {
    tx = await ChefIncentivesController.addPool(
      allVariableDebtTokenAddressesArray[i],
      100n
    );
    await tx.wait(2);
  }

  for (let i = 0; i < allStableDebtTokenAddressesArray.length; i++) {
    tx = await ChefIncentivesController.addPool(
      allStableDebtTokenAddressesArray[i],
      10n
    );
    await tx.wait(2);
  }

  console.log(`\nDone adding pools to ChefIncentivesController\n`);

  //

  /* 14. Start ChefInventivesController */

  //

  const ChefInventivesController = new ethers.Contract(
    contractAddresses.ChefIncentivesController,
    abi.ChefIncentivesController,
    signer
  );

  console.log(`\n14. Starting ChefInventivesController\n`);

  tx = await ChefInventivesController.start();
  await tx.wait(2);

  console.log(`\nSuccessfully started ChefIncentivesController\n`);

  //

  /* 15. Add Liquidity to SwapRouter */

  //
  console.log(`\n15. Add Liquidity to DEX... \n`);

  const SwapRouter = new ethers.Contract(
    contractAddresses.SwapRouter,
    abi.SwapRouter,
    signer
  );

  const ProtocolToken = new ethers.Contract(
    contractAddresses.ManekiPaw,
    abi.MockToken,
    signer
  );
  const approvalTx = await ProtocolToken.approve(
    contractAddresses.SwapRouter,
    ethers.constants.MaxUint256
  );

  await approvalTx.wait(1);

  console.log(`\nSuccessfully added liquidity to DEX\n`);

  /* Display deployed smart contracts */
  console.log(deploymentLog);

  // /* Write deployed smart contracts */
  // fs.appendFile(
  //   "./scripts/information/contractAddresses.txt",
  //   deploymentLog,
  //   function (err) {
  //     if (err) throw err;
  //     console.log("Written Deployment Log!");
  //   }
  // );

  /* Verify Smart Contract via Etherscan API */

  if (isSupportedNetwork(currentChainID)) {
    // Not deployable to BSC Testnet
    // await ParaSwapLiquiditySwapAdapter.deployTransaction.wait(6);
    // await verify(ParaSwapLiquiditySwapAdapter.address, [
    //   contractAddresses.PoolAddressesProvider,
    //   contractAddresses.ParaSwapAugustusRegistry,
    //   await signer.getAddress(),
    // ]);
    // await ParaSwapRepayAdapter.deployTransaction.wait(6);
    // await verify(ParaSwapRepayAdapter.address, [
    //   contractAddresses.PoolAddressesProvider,
    //   contractAddresses.ParaSwapAugustusRegistry,
    //   await signer.getAddress(),
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
