/*
Misc script to deploy and test MerkleDistributor
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
const { timeStamp } = require("console");

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

  /* 1. Deploy Protocol Native Token */

  //

  console.log("\n1. Deploying ManekiPaw Token...\n");
  const startingTimestamp = (
    await provider.getBlock(await provider.getBlockNumber())
  ).timestamp;
  const ManekiPawFactory = await ethers.getContractFactory("ManekiPawToken");
  const ManekiPaw = await ManekiPawFactory.deploy(
    1_000_000_000n * ETHER,
    200_000_000n * ETHER,
    startingTimestamp
  );
  await ManekiPaw.deployed();
  console.log(
    `Successfully deployed @ManekiPawToken at address: ${ManekiPaw.address} `
  );

  deploymentLog += `\nManekiPaw: \"${ManekiPaw.address}\",\n`;

  //

  /* 2. Deploy MultiFeeDistribution Contract */

  //

  console.log("\n2. Deploying MultiFeeDistribution Contract...\n");
  const MultiFeeDistributionFactory = await ethers.getContractFactory(
    "MultiFeeDistribution"
  );
  const MultiFeeDistribution = await MultiFeeDistributionFactory.deploy(
    ManekiPaw.address
  );
  await MultiFeeDistribution.deployed();
  console.log(
    `Successfully deployed @MultiFeeDistribution at address: ${MultiFeeDistribution.address} `
  );

  deploymentLog += `\nMultiFeeDistribution: \"${MultiFeeDistribution.address}\",\n`;

  // //

  // /* 3. Deploy MerkleDistributor Contract */

  // //

  // console.log("\n3. Deploying MerkleDistributor Contract...\n");
  // const MerkleDistributorFactory = await ethers.getContractFactory(
  //   "MerkleDistributor"
  // );
  // const MerkleDistributor = await MerkleDistributorFactory.deploy(
  //   MultiFeeDistribution.address,
  //   200_000_000n * ETHER
  // );
  // await MerkleDistributor.deployed();
  // console.log(
  //   `Successfully deployed @MerkleDistributor at address: ${MerkleDistributor.address} `
  // );

  // deploymentLog += `\nMerkleDistributor: \"${MerkleDistributor.address}\",\n`;

  console.log("\n2. Deploying MasterChef Contract...\n");
  const MasterChefFactory = await ethers.getContractFactory("MasterChef");
  const MasterChef = await MasterChefFactory.deploy(
    [
      //uint128
      0 * DAY,
      7 * DAY,
      30 * DAY,
      90 * DAY,
      270 * DAY,
      365 * DAY,
    ],
    [1n * ETHER, 2n * ETHER, 3n * ETHER, 5n * ETHER, 8n * ETHER, 10n * ETHER],
    await signer.getAddress(),
    MultiFeeDistribution.address,
    300_000_000n * ETHER
  );
  await MasterChef.deployed();
  console.log(
    `Successfully deployed @MasterChef at address: ${MasterChef.address} `
  );

  deploymentLog += `\nMasterChef: \"${MasterChef.address}\",\n`;

  //

  /* 4. Setting Minters On MultiFeeDistribution */

  //

  await MultiFeeDistribution.setMinters([
    await signer.getAddress(),
    MasterChef.address,
  ]);

  console.log(`Successfully set minter on MultiFeeDistribution`);

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
    await ManekiPaw.deployTransaction.wait(6);
    await verify(ManekiPaw.address, [
      1_000_000_000n * ETHER,
      200_000_000n * ETHER,
      startingTimestamp,
    ]);
    await MultiFeeDistribution.deployTransaction.wait(3);
    await verify(MultiFeeDistribution.address, [ManekiPaw.address]);

    // await MerkleDistributor.deployTransaction.wait(3);
    // await verify(MerkleDistributor.address, [
    //   MultiFeeDistribution.address,
    //   200_000_000n * ETHER,
    // ]);
    // // await Collector.deployTransaction.wait(6);
    // await verify(Collector.address, []);
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
