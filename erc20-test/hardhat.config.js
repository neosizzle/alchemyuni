require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org", // Replace with the actual network URL
      accounts: ["daf7d1ae3b8913995ea1531308eaa7589122614c84722984430f101ce56213ee"]
    }
  },
};
