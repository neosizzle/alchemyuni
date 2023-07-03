const interestRateStrategiesConfiguration = [
  {
    strategyName: "Stablecoin",
    optimalUsageRatio: 850000000000000000000000000n, //Optimal Utilization: 80%
    baseVariableBorrowRate: 5000000000000000000000000n, //Base VariableRate: 0.5%
    variableRateSlope1: 60000000000000000000000000n, //Interest Rate During Optimal Utilization: 6%
    variableRateSlope2: 780000000000000000000000000n, //Interest Rate During Optimal Utilization: 6% + 78%
    stableRateSlope1: 60000000000000000000000000n,
    stableRateSlope2: 780000000000000000000000000n,
    baseStableRateOffset: 5000000000000000000000000n, //stableBorrowRate: 5.0% above variableRate
    stableRateExcessOffset: 5000000000000000000000000n, //stableBorrowRate + Extra 5.0% when more than optimizationRatio
    optimalStableToTotalDebtRatio: 500000000000000000000000000n, //Optimization ratio for stable vs variable debt
  },
  {
    strategyName: "LowRiskAsset",
    optimalUsageRatio: 500000000000000000000000000n, //Optimal Utilization: 50%
    baseVariableBorrowRate: 8000000000000000000000000n, //Base VariableRate: 0.8%
    variableRateSlope1: 80000000000000000000000000n, //Interest Rate During Optimal Utilization: 8%
    variableRateSlope2: 3000000000000000000000000000n, //Interest Rate During Optimal Utilization: 8% + 300%
    stableRateSlope1: 80000000000000000000000000n,
    stableRateSlope2: 3000000000000000000000000000n,
    baseStableRateOffset: 5000000000000000000000000n, //stableBorrowRate: 5.0% above variableRate
    stableRateExcessOffset: 5000000000000000000000000n, //stableBorrowRate + Extra 5.0% when more than optimizationRatio
    optimalStableToTotalDebtRatio: 500000000000000000000000000n,
  },
  {
    strategyName: "HighRiskAsset",
    optimalUsageRatio: 450000000000000000000000000n, //Optimal Utilization: 50%
    baseVariableBorrowRate: 10000000000000000000000000n, //Base VariableRate: 1%
    variableRateSlope1: 100000000000000000000000000n, //Interest Rate During Optimal Utilization: 10%
    variableRateSlope2: 3600000000000000000000000000n, //Interest Rate During Optimal Utilization: 10% + 360%
    stableRateSlope1: 100000000000000000000000000n,
    stableRateSlope2: 3600000000000000000000000000n,
    baseStableRateOffset: 5000000000000000000000000n, //stableBorrowRate: 8.0% above variableRate
    stableRateExcessOffset: 5000000000000000000000000n, //stableBorrowRate + Extra 15.0% when more than optimizationRatio
    optimalStableToTotalDebtRatio: 500000000000000000000000000n,
  },
];

module.exports = interestRateStrategiesConfiguration;
