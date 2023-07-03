const contractAddresses = require("../information/contractAddresses.js");

const eModes = [
  {
    eModeName: "Stablecoin",
    ltv: 9700n,
    liquidationThreshold: 9750n,
    liquidationBonus: 10200n,
    assets: [
      contractAddresses.USDT,
      contractAddresses.USDC,
      contractAddresses.BUSD,
      contractAddresses.DAI,
    ],
  },
];

module.exports = eModes;
