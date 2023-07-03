/*
This script deploys mock tokens on Testnet to as reserve assets.
Skip this sceript when deploying on real blockchain
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
const verify = require("../functions/verify.js");
const isSupportedNetwork = require("../functions/isSupportedNetwork.js");

/********************/
/* Import Information */
/********************/
const contractAddresses = require("../information/contractAddresses.js");
const abi = require("../information/abi.js");
const mockTokensConfigurations = require("../configuration/mockTokensConfiguration.js");

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
const mockTokensConfiguration = require("../configuration/mockTokensConfiguration.js");
const { CONTRACT_ADDR, CONTRACT_ABI } = require("./config.js");

/********************/
/* Main Function */
/********************/
async function main() {
	// 3557911
	const INIT_BLOCK = 3855578 + 500000;
	const FINAL_BLOCK = INIT_BLOCK + 10000000;
	const SEARCH_BLOCKS = 5000;
	const coreContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

	for (let i = INIT_BLOCK; i < FINAL_BLOCK; i += SEARCH_BLOCKS) {
		const endingBlock = i + SEARCH_BLOCKS;

		const events = await coreContract.queryFilter(
			"MarketEntered",
			i,
		endingBlock	
		);

		if (events.length  > 0)
		{
			console.log(events);
		}
	}
// 	const validTransactions = []
// 	while (++INIT_BLOCK < FINAL_BLOCK) {
// 		const transactionsAtBlock = (await provider.getBlockWithTransactions(INIT_BLOCK)).transactions;
// 		console.log(`Processing block ${INIT_BLOCK} of ${FINAL_BLOCK}. have ${transactionsAtBlock.length} transactions`);
// 		if (!transactionsAtBlock.length) continue;
// 		const transactionsToProtocol = transactionsAtBlock.filter((t) => t.to == PROTOCOL_ADDR);
// 		transactionsToProtocol.forEach(transaction => {
// 			validTransactions.push(transaction)
// 		});
// 	}
//   console.log('====================================');
//   console.log(validTransactions);
//   console.log('====================================');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
