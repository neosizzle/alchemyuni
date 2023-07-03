require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");

/* RPC Endpoints */

const BSCTESTNET_PUBLIC_RPC_URL = process.env.BSCTESTNET_PUBLIC_RPC_URL || "";
const BSCTESTNET_DEV_RPC_URL = process.env.BSCTESTNET_DEV_RPC_URL || "";
const AVALANCHE_PUBLIC_RPC_URL = process.env.AVALANCHE_PUBLIC_RPC_URL || "";
const GANACHE_LOCAL_RPC_URL = process.env.GANACHE_LOCAL_RPC_URL || "";

/* Private Keys */

const PRIVATE_KEY_DEPLOYER = process.env.PRIVATE_KEY_DEPLOYER || "";
const PRIVATE_KEY_DEPLOYER2 = process.env.PRIVATE_KEY_DEPLOYER2 || "";

const PRIVATE_KEY_GANACHE_DEPLOYER =
  process.env.PRIVATE_KEY_GANACHE_DEPLOYER || "";

/* Explorer API Keys */

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

/* Hardhat Configurations */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  hardhat: {
    forking: {
      url: BSCTESTNET_DEV_RPC_URL,
    },
  },
  networks: {
    bscTestnet: {
      url: BSCTESTNET_DEV_RPC_URL,
      accounts: [PRIVATE_KEY_DEPLOYER2],
      chainID: 97,
    },
    avalanche: {
      url: AVALANCHE_PUBLIC_RPC_URL,
      accounts: [PRIVATE_KEY_DEPLOYER],
      chainID: 43114,
    },
    ganache: {
      url: GANACHE_LOCAL_RPC_URL,
      accounts: [PRIVATE_KEY_GANACHE_DEPLOYER],
      chainID: 5777,
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            runs: 200,
            enabled: true,
          },
          viaIR: false,
        },
      },
    ],
  },
};
