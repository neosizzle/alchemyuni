const GWEI = 10n ** 9n;
const ETHER = 10n ** 18n;
const ETHER_SMALL = 10 ** 18;

const DAY = 86400;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const mintersConfiguration = {
  ChefIncentivesConfiguration: {
    timeFrame: [
      //uint128
      0 * DAY,
      7 * DAY,
      30 * DAY,
      90 * DAY,
      270 * DAY,
      365 * DAY,
    ],
    emission: [
      1n * ETHER,
      2n * ETHER,
      3n * ETHER,
      5n * ETHER,
      8n * ETHER,
      10n * ETHER,
    ],
    maxMintable: 200_000_000n * ETHER,
  },
  MasterChefConfiguration: {
    timeFrame: [
      //uint128
      0 * DAY,
      7 * DAY,
      30 * DAY,
      90 * DAY,
      270 * DAY,
      365 * DAY,
    ],
    emission: [
      1n * ETHER,
      2n * ETHER,
      3n * ETHER,
      5n * ETHER,
      8n * ETHER,
      10n * ETHER,
    ],
    maxMintable: 200_000_000n * ETHER,
  },
  MerkleDistributorConfiguration: { maxMintable: 200_000_000n * ETHER },
  TokenVestingConfiguration: {
    maxMintable: 200_000_000n * ETHER,
    receivers: [
      "0xc8B51e7497fD5edFDd5881995924823BeFBe3F04",
      "0x25Aa761B02C45D2B57bBb54Dd04D42772afdd291",
      "0x590979203052a4cE833e1Ba36901cFDC49A26846",
    ],
    receiversAmount: [
      100_000_000n * ETHER,
      60_000_000n * ETHER,
      40_000_000n * ETHER,
    ],
    vestingPeriod: 180 * DAY,
  },
};

module.exports = mintersConfiguration;
