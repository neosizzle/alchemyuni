/********************/
/* Constants & Variables */
/********************/
const GWEI = 10n ** 9n;
const ETHER = 10n ** 18n;

const DAY = 86400;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const mockTokensConfiguration = [
  {
    name: "Wrapped Bitcoin",
    ticker: "WBTC",
    supply: 100000n * ETHER,
    oracle: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
  },
  {
    name: "Wrapped Ether",
    ticker: "WETH",
    supply: 1000000n * ETHER,
    oracle: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  },
  {
    name: "Wrapped Litecoin",
    ticker: "LTC",
    supply: 2000000n * ETHER,
    oracle: "0x9Dcf949BCA2F4A8a62350E0065d18902eE87Dca3",
  },
  {
    name: "Aave Token",
    ticker: "AAVE",
    supply: 1000000n * ETHER,
    oracle: "0x298619601ebCd58d0b526963Deb2365B485Edc74",
  },
  {
    name: "Tether USD",
    ticker: "USDT",
    supply: 2000000000n * ETHER,
    oracle: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
  },
  {
    name: "USD Coin",
    ticker: "USDC",
    supply: 2000000000n * ETHER,
    oracle: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
  },
  {
    name: "Binance USD",
    ticker: "BUSD",
    supply: 2000000000n * ETHER,
    oracle: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
  },
  {
    name: "Dai Token",
    ticker: "DAI",
    supply: 2000000000n * ETHER,
    oracle: "0xE4eE17114774713d2De0eC0f035d4F7665fc025D",
  },
];

module.exports = mockTokensConfiguration;
