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

const mintersConfiguration = require("./configuration/mintersConfiguration.js");
let tx;

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

  /* 1. Deploy ChefIncentivesController */

  //

  console.log("\n1. Deploying ChefIncentivesController...\n");
  const ChefIncentivesControllerFactory = await ethers.getContractFactory(
    "ChefIncentivesController"
  );
  const ChefIncentivesController = await ChefIncentivesControllerFactory.deploy(
    mintersConfiguration.ChefIncentivesConfiguration.timeFrame,
    mintersConfiguration.ChefIncentivesConfiguration.emission,
    await signer.getAddress(),
    // contractAddresses.PoolConfiguratorProxy, //Temporary set as owner
    contractAddresses.MultiFeeDistribution,
    mintersConfiguration.ChefIncentivesConfiguration.maxMintable
  );
  await ChefIncentivesController.deployed();
  console.log(
    `Successfully deployed @ChefIncentivesController at address: ${ChefIncentivesController.address} `
  );

  deploymentLog += `\nChefIncentivesController: \"${ChefIncentivesController.address}\",\n`;

  //

  /* 2. Deploy MasterChef */

  //

  console.log("\n2. Deploying MasterChef...\n");
  const MasterChefFactory = await ethers.getContractFactory("MasterChef");
  const MasterChef = await MasterChefFactory.deploy(
    mintersConfiguration.MasterChefConfiguration.timeFrame,
    mintersConfiguration.MasterChefConfiguration.emission,
    await signer.getAddress(),
    // contractAddresses.PoolConfiguratorProxy, //Temporary set as owner
    contractAddresses.MultiFeeDistribution,
    mintersConfiguration.MasterChefConfiguration.maxMintable
  );
  await MasterChef.deployed();
  console.log(
    `Successfully deployed @MasterChef at address: ${MasterChef.address} `
  );

  deploymentLog += `\nMasterChef: \"${MasterChef.address}\",\n`;

  //

  /* 3. Deploy Merkle Distributor */

  //

  console.log("\n3. Deploying MerkleDistributor...\n");
  const MerkleDistributorFactory = await ethers.getContractFactory(
    "MerkleDistributor"
  );
  const MerkleDistributor = await MerkleDistributorFactory.deploy(
    contractAddresses.MultiFeeDistribution,
    mintersConfiguration.MerkleDistributorConfiguration.maxMintable
  );
  await MerkleDistributor.deployed();
  console.log(
    `Successfully deployed @MerkleDistributor at address: ${MerkleDistributor.address} `
  );

  deploymentLog += `\nMerkleDistributor: \"${MerkleDistributor.address}\",\n`;

  //

  /* 4. Deploy TokenVesting */

  //

  console.log("\n4. Deploying TokenVesting...\n");
  const TokenVestingFactory = await ethers.getContractFactory("TokenVesting");
  const TokenVesting = await TokenVestingFactory.deploy(
    contractAddresses.MultiFeeDistribution,
    mintersConfiguration.TokenVestingConfiguration.maxMintable,
    mintersConfiguration.TokenVestingConfiguration.receivers,
    mintersConfiguration.TokenVestingConfiguration.receiversAmount,
    mintersConfiguration.TokenVestingConfiguration.vestingPeriod
  );
  await TokenVesting.deployed();
  console.log(
    `Successfully deployed @TokenVesting at address: ${TokenVesting.address} `
  );

  deploymentLog += `\nTokenVesting: \"${TokenVesting.address}\",\n`;

  // //

  // /* 5. setIncentivesController on MultiFeeDistribution */

  // //

  const MultiFeeDistribution = new ethers.Contract(
    contractAddresses.MultiFeeDistribution,
    abi.MultiFeeDistribution,
    signer
  );

  console.log(
    "\n5. Calling @setIncentivesController() - MultiFeeDistribution\n"
  );
  tx = await MultiFeeDistribution.setIncentivesController(
    ChefIncentivesController.address
  );
  await tx.wait(3);
  console.log(
    "\nSuccessfully set ChefIncentivesController via @setIncentivesController() on MultiFeeDistributio\n"
  );

  // //

  // /* 6. setMinters on MultiFeeDistribution */

  // //

  console.log("\n6. Calling @setMinters() - MultiFeeDistribution\n");
  tx = await MultiFeeDistribution.setMinters([
    ChefIncentivesController.address,
    MasterChef.address,
    MerkleDistributor.address,
    TokenVesting.address,
  ]);
  console.log(
    "Successfully set ChefIncentivesController, MasterChef, MerkleDistributor and TokenVesting as minters on MultiFeeDistribution\n"
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
    await ChefIncentivesController.deployTransaction.wait(6);
    await verify(ChefIncentivesController.address, [
      mintersConfiguration.ChefIncentivesConfiguration.timeFrame,
      mintersConfiguration.ChefIncentivesConfiguration.emission,
      await signer.getAddress(),
      // contractAddresses.PoolConfiguratorProxy, //Temporary set as owner
      contractAddresses.MultiFeeDistribution,
      mintersConfiguration.ChefIncentivesConfiguration.maxMintable,
    ]);

    await MasterChef.deployTransaction.wait(6);
    await verify(MasterChef.address, [
      mintersConfiguration.MasterChefConfiguration.timeFrame,
      mintersConfiguration.MasterChefConfiguration.emission,
      await signer.getAddress(),
      // contractAddresses.PoolConfiguratorProxy, //Temporary set as owner
      contractAddresses.MultiFeeDistribution,
      mintersConfiguration.MasterChefConfiguration.maxMintable,
    ]);

    await MerkleDistributor.deployTransaction.wait(6);
    await verify(MerkleDistributor.address, [
      contractAddresses.MultiFeeDistribution,
      mintersConfiguration.MerkleDistributorConfiguration.maxMintable,
    ]);

    await TokenVesting.deployTransaction.wait(6);
    await verify(TokenVesting.address, [
      contractAddresses.MultiFeeDistribution,
      mintersConfiguration.TokenVestingConfiguration.maxMintable,
      mintersConfiguration.TokenVestingConfiguration.receivers,
      mintersConfiguration.TokenVestingConfiguration.receiversAmount,
      mintersConfiguration.TokenVestingConfiguration.vestingPeriod,
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
