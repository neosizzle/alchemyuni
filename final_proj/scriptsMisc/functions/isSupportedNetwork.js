const supportedNetworksList = require("../configuration/supportedNetworksList.js");

function isSupportedNetwork(chainID) {
  const supportedNetworks = supportedNetworksList;
  if (supportedNetworks.includes(chainID)) return true;
  else return false;
}

module.exports = isSupportedNetwork;
