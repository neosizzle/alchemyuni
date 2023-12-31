const contractAddresses = {
  ParaSwapAugustusRegistry: "0x161383b5dAFc1cc05Ec058e5B0b0703BA175bdA6",

  NativeWrappedToken: "0x69c5207A60C8e34311E44A2E10afa0CB4dbFC8df",

  WBNB: "0x69c5207A60C8e34311E44A2E10afa0CB4dbFC8df",

  BNBOracle: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",

  WBTC: "0x723ba1560b72479cb5956a8dae0f9bcdd9b34f15",

  WBTCOracle: "0x5741306c21795fdcbb9b265ea0255f499dfe515c",

  WETH: "0xfefdef26f8093a048e32893d1f62f1e0b0d81f15",

  WETHOracle: "0x143db3ceefbdfe5631add3e50f7614b6ba708ba7",

  LTC: "0xd5cb29c9195e4778640a6654bb9ce93815c048d0",

  LTCOracle: "0x9dcf949bca2f4a8a62350e0065d18902ee87dca3",

  AAVE: "0x79168bac4a98c2bb4d77bb83651183d4e03d1d12",

  AAVEOracle: "0x298619601ebcd58d0b526963deb2365b485edc74",

  USDT: "0x3886dc9ac5be3dc74fd32d527978b05c4e08717e",

  USDTOracle: "0xeca2605f0bcf2ba5966372c99837b1f182d3d620",

  USDC: "0x0614e13220a4857482e1e46340bf1d03aaa238dd",

  USDCOracle: "0x90c069c4538adac136e051052e14c1cd799c41b7",

  BUSD: "0x8b34c6350cacc43abff7f09260ba0aa05fd7581b",

  BUSDOracle: "0x9331b55d9830ef609a2abcfac0fbce050a52fdea",

  DAI: "0x240127f68f3c7bbb68d18e1b19fd2830b2a1655e",

  DAIOracle: "0xe4ee17114774713d2de0ec0f035d4f7665fc025d",

  PoolAddressesProviderRegistry: "0x8A623A6b7872F163A0B2754E4592c615fDe68eb0",

  SupplyLogic: "0xe00Cd14640849A8640405fe59097E7d10E4dDeA7",

  BorrowLogic: "0xCdE2f82e27D22efdD0D36e7a1Ce42436285C4ab7",

  LiquidationLogic: "0xf9C6F91568E1c1359dD68eDF6B5de0DF045517C0",

  EModeLogic: "0x1eb6c8C96F20806f7ebAdbF347a9443B98095b5E",

  BridgeLogic: "0xb92F80FD8f9dc8B64d486b05Fc81b9B946857b46",

  ConfiguratorLogic: "0x5F9309A9f9a1d40Ea7D823B30F20475e8C2d9b5C",

  FlashLoanLogic: "0x09Fd88d8474da37AB7D09697B694bEEED55bF5db",

  PoolLogic: "0xA027242f8Ec1374dc515c1419f5835814A80612b",

  Treasury: "0x1f1603D7DAC46207D87686fE8B4D73bf3839FbaB",

  CollectorController: "0x4624C29D998F2620780802ae0B91E8c27c366Bd9",

  Collector: "0x4dcF1f04F9Bf5f13727C5CFD1d961ccae5A88714",

  //V3 Compatible Version
  WalletBalanceProvider: "0x517766582B8159F9C378FF047d1448C2Bf4Da5Ff",

  //V3 Compatible Version
  UiIncentiveDataProvider: "0x12B2750cebF9f8B321349cf79fED70429d358Fd2",

  //V3 Compatible Version
  UiPoolDataProvider: "0x1Bb5390ABbE8e347c85373178709Fae216D32829",

  UiPoolDataProviderV3Amended: "0xa35B1B57ab6D7cCF102dcCFFCE9A05a86C0450D3",

  PoolAddressesProvider: "0xbBFC6b0189a127D4DC7F891CD9E528E0B75e32f5",

  AaveProtocolDataProvider: "0xC85E7aFc61Bbe429026c1A5b5dc202A231561E29",

  PoolImplementation: "0xc8797D7A184Cea8c096182EBcFd7a3806a6DAF0a",

  PoolConfiguratorImplementation: "0x6adF21793446a1CD3c8901b16B92E8C910c64cfB",

  ReservesSetupHelper: "0xf1fC2bb17bD7A015f170Bf2055CEbA3B10f74be2",

  ACLManager: "0x2D689461563C712B74d9224521EdDd7f27f291fB",

  AaveOracle: "0x750539fBF9106Ea46DC4e7F9b400B76aF397194f",

  PoolProxy: "0xB5cfcD7E73634460D06bFc4f6059962d079567a7",

  PoolConfiguratorProxy: "0xa78f104651528a9817d073304e210beebde70138",

  RewardsControllerProxy: "0x81b61143C91Ef4fdb96876dB39E01948DE19A545",

  RewardsController: "0x3ea25eA96189C113aEf12859638de198E6fd0665",

  PullRewardsTransferStrategy: "0xbE3aa427AB6041fA770B572BEfC83f11588FE834",

  AToken: "0x49fBaaE73e5D08b51228586a6D502D6cd75C4eAb",

  DelegationAwareAToken: "0x1f75aAeb3C0067e3871b964C660e6CdddDcc5194",

  StableDebtToken: "0x629807a1571Bde5314Ae0812D22B188cB6aEc1A2",

  VariableDebtToken: "0xaa7cab2eD6EAFe4a02aE06caF341f46051c2394d",

  //V3 Compatible Version
  WETHGateway: "0xb3322833eD4e52b7B9a83d6Dc71C6a6D1B3464E5",

  //InterestRateStrategies
  StablecoinStrategy: "0xd759A93E5d99A635c9cF7b197Fc1C13a8b927d9B",

  LowRiskAssetStrategy: "0xe64b56Ea76eAF037C9e2494C403FD1e349fdf9ac",

  HighRiskAssetStrategy: "0x0Ca35ffFa3Dc76253a219f9B5FC8C9CE982FA97d",
};

module.exports = contractAddresses;
