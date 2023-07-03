# Aave V3 Deployment Script

This project is the Hardhat scripts to deploy AaveV3's core and periphery smart contracts to EVM compatible blockchain.

## Beforehand

- Make sure you get relevant development endpoint from related services provider, can get from Quicknode(BSC), Moralis, Infura etc.
- Register etherscan(ethereum) / bscScan(Binance Smart Chain) / Snowtrace(Avalanche) / ftmscan(Fantom) / polygonScan(polygon) etc api keys
- These blockchain explorers are all build by the same team, thus functioning exactly the same in terms of smart contracts verification. When deploying on an EVM Chain that the etherscan team does not support, tweak the verification logic

## How to run deployment scripts

```
yarn run hardhat run scripts/${scriptName} --network {networkName}
```

Configure the network information in hardhat.config.js

## Instructions

Step 0: (Skip when deploying to real network)

- If you are deploying to a testnet, run script 0-deployTestnetMockTokensto deploy mock tokens.
- Configure your mock tokens informations under the configuration/mockTokensConfiguration.js.
- Paste the written addresses to contractAddresses.js

Step 1: (Deploy logic libraries)

- Run script to deployment logics and libraries smart contracts
- No configuration needed.
- Paste the written addresses to contractAddresses.js

Step 2: (Deploy collector and protocol treasury addresses, can modify it if were to use customized treasury logics)

- Run script
- No configuration needed.
- Paste the written addresses to contractAddresses.js

Step 3: (Deploy pool related contracts part 1)

- Configure protocolOwner(different with deployer), networkBaseCurrencyOracle & Eth Oracle (get form ChainLink), and marketName
- Run script
- Paste the written addresses to contractAddresses.js

Step 4: (Deploy pool related contracts part 2)

- No configuration needed
- Run script
- Paste the written addresses to contractAddresses.js

Step 5: (Deploy AaveOracle)

- Configure asset and respective oracle addresses supportedAssetsAndOracles.js
- Run script
- Paste the written addresses to contractAddresses.js

Step 6: (Configure LendingPool)

- No configuration needed
- Run script
- Paste the written addresses to contractAddresses.js

Step 7: (Deploy rewards related smart contracts based on AaveV3 mechanism, need to modify it with Geist's MultiFeeDistribution method)

- No configuration needed
- Run script
- Paste the written addresses to contractAddresses.js

Step 8: (Deploy ATokens Implementation Logics and WETHGateway)

- No configuration needed
- Run script
- Paste the written addresses to contractAddresses.js

Step 9: (Deploy Interest Rate Strategies)

- Configure type of interest rates under configuration/interestRateStrategiesConfiguration.js
- Run script
- Paste the written addresses to contractAddresses.js

Step 10: (Initialize the entire protocol)

- Configure eModes, initReservesInputConfiguration and configureReservesInput under configuration/
- Run script
- Paste the written addresses to contractAddresses.js
