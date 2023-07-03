/********************/
/* Constants & Variables */
/********************/
const GWEI = 10n ** 9n;
const ETHER = 10n ** 18n;

const DAY = 86400;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const mockOracleConfiguration = [
  {
    name: "Wrapped Binance Coin",
    ticker: "BNB",
    description: "BNB / USD",
    decimals: 8,
    latestAnswer: 30400352758n,
  },
  {
    name: "Wrapped Bitcoin",
    ticker: "WBTC",
    description: "BTC / USD",
    decimals: 8,
    latestAnswer: 2375499000000n,
  },
  {
    name: "Wrapped Ether",
    ticker: "WETH",
    description: "ETH / USD",
    decimals: 8,
    latestAnswer: 165255000000n,
  },
  {
    name: "Wrapped Litecoin",
    ticker: "LTC",
    description: "LTC / USD",
    decimals: 8,
    latestAnswer: 9783547159n,
  },
  {
    name: "Aave Token",
    ticker: "AAVE",
    description: "AAVE / USD",
    decimals: 8,
    latestAnswer: 8185000000n,
  },
  {
    name: "Tether USD",
    ticker: "USDT",
    description: "USDT / USD",
    decimals: 8,
    latestAnswer: 100000000n,
  },
  {
    name: "USD Coin",
    ticker: "USDC",
    description: "USDC / USD",
    decimals: 8,
    latestAnswer: 100000000n,
  },
  {
    name: "Binance USD",
    ticker: "BUSD",
    description: "BUSD / USD",
    decimals: 8,
    latestAnswer: 100000000n,
  },
  {
    name: "Dai Token",
    ticker: "DAI",
    description: "DAI / USD",
    decimals: 8,
    latestAnswer: 100000000n,
  },
];

module.exports = mockOracleConfiguration;
