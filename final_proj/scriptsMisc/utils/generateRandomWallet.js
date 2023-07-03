const { ethers, run, network } = require("hardhat");
const dotenv = require("dotenv")
dotenv.config();

async function main() {
	const wallet =  ethers.Wallet.createRandom()
	console.log('====================================');
	console.log(`addr : ${wallet.address}, key : ${wallet.privateKey}`);
	console.log('====================================');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})
.then(()=>{});
