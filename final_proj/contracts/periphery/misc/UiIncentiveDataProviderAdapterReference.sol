//     /*
//     struct AggregatedReserveIncentiveData {
//     address underlyingAsset;
//     IncentiveData aIncentiveData {
//         address tokenAddress
//         address incentiveControllerAddress
//         RewardInfo[] rewardsTokenInformation [
//             {
//                     string rewardTokenSymbol;
//                     address rewardTokenAddress;
//                     address rewardOracleAddress;
//                     uint256 emissionPerSecond;
//                     uint256 incentivesLastUpdateTimestamp;
//                     uint256 tokenIncentivesIndex;
//                     uint256 emissionEndTimestamp;
//                     int256 rewardPriceFeed;
//                     uint8 rewardTokenDecimals;
//                     uint8 precision;
//                     uint8 priceFeedDecimals;
//             }
//         ]
//     }

//     IncentiveData vIncentiveData {

//     }
//     IncentiveData sIncentiveData {

//     }

//     }
//     */

/*
  struct UserReserveIncentiveData {
    address underlyingAsset;
    UserIncentiveData aTokenIncentivesUserData;
    UserIncentiveData vTokenIncentivesUserData;
    UserIncentiveData sTokenIncentivesUserData;
  }

  struct UserIncentiveData {
    address tokenAddress;
    address incentiveControllerAddress;
    UserRewardInfo[] userRewardsInformation;
  }

  struct UserRewardInfo {
    string rewardTokenSymbol;
    address rewardOracleAddress;
    address rewardTokenAddress;
    uint256 userUnclaimedRewards;
    uint256 tokenIncentivesUserIndex;
    int256 rewardPriceFeed;
    uint8 priceFeedDecimals;
    uint8 rewardTokenDecimals;
  }

 */

// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import {IERC20Detailed} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IncentivizedERC20} from "@aave/core-v3/contracts/protocol/tokenization/base/IncentivizedERC20.sol";
import {UserConfiguration} from "@aave/core-v3/contracts/protocol/libraries/configuration/UserConfiguration.sol";
import {DataTypes} from "@aave/core-v3/contracts/protocol/libraries/types/DataTypes.sol";
import {IRewardsController} from "../rewards/interfaces/IRewardsController.sol";
import {IEACAggregatorProxy} from "./interfaces/IEACAggregatorProxy.sol";
import {IUiIncentiveDataProviderV3} from "./interfaces/IUiIncentiveDataProviderV3.sol";
import {ChefIncentivesController} from "../../maneki/ChefIncentivesController.sol";
import {SafeMath} from "../../core/dependencies/openzeppelin/contracts/SafeMath.sol";

abstract contract UiIncentiveDataProviderV4 is IUiIncentiveDataProviderV3 {
    function _getUserReservesIncentivesData(
        IPoolAddressesProvider provider,
        address user
    ) private view returns (UserReserveIncentiveData[] memory) {
        IPool pool = IPool(provider.getPool());
        address[] memory reserves = pool.getReservesList();

        UserReserveIncentiveData[]
            memory userReservesIncentivesData = new UserReserveIncentiveData[](
                user != address(0) ? reserves.length : 0
            );

        for (uint256 i = 0; i < reserves.length; i++) {
            DataTypes.ReserveData memory baseData = pool.getReserveData(
                reserves[i]
            );

            // user reserve data
            userReservesIncentivesData[i].underlyingAsset = reserves[i];

            IRewardsController aTokenIncentiveController = IRewardsController(
                address(
                    IncentivizedERC20(baseData.aTokenAddress)
                        .getIncentivesController()
                )
            );
            if (address(aTokenIncentiveController) != address(0)) {
                // get all rewards information from the asset
                address[]
                    memory aTokenRewardAddresses = aTokenIncentiveController
                        .getRewardsByAsset(baseData.aTokenAddress);
                UserRewardInfo[]
                    memory aUserRewardsInformation = new UserRewardInfo[](
                        aTokenRewardAddresses.length
                    );
                for (uint256 j = 0; j < aTokenRewardAddresses.length; ++j) {
                    UserRewardInfo memory userRewardInformation;
                    userRewardInformation
                        .rewardTokenAddress = aTokenRewardAddresses[j];

                    userRewardInformation
                        .tokenIncentivesUserIndex = aTokenIncentiveController
                        .getUserAssetIndex(
                            user,
                            baseData.aTokenAddress,
                            userRewardInformation.rewardTokenAddress
                        );

                    userRewardInformation
                        .userUnclaimedRewards = aTokenIncentiveController
                        .getUserAccruedRewards(
                            user,
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation.rewardTokenDecimals = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).decimals();
                    userRewardInformation.rewardTokenSymbol = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).symbol();

                    // Get price of reward token from Chainlink Proxy Oracle
                    userRewardInformation
                        .rewardOracleAddress = aTokenIncentiveController
                        .getRewardOracle(
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation
                        .priceFeedDecimals = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).decimals();
                    userRewardInformation.rewardPriceFeed = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).latestAnswer();

                    aUserRewardsInformation[j] = userRewardInformation;
                }

                userReservesIncentivesData[i]
                    .aTokenIncentivesUserData = UserIncentiveData(
                    baseData.aTokenAddress,
                    address(aTokenIncentiveController),
                    aUserRewardsInformation
                );
            }

            // variable debt token
            IRewardsController vTokenIncentiveController = IRewardsController(
                address(
                    IncentivizedERC20(baseData.variableDebtTokenAddress)
                        .getIncentivesController()
                )
            );
            if (address(vTokenIncentiveController) != address(0)) {
                // get all rewards information from the asset
                address[]
                    memory vTokenRewardAddresses = vTokenIncentiveController
                        .getRewardsByAsset(baseData.variableDebtTokenAddress);
                UserRewardInfo[]
                    memory vUserRewardsInformation = new UserRewardInfo[](
                        vTokenRewardAddresses.length
                    );
                for (uint256 j = 0; j < vTokenRewardAddresses.length; ++j) {
                    UserRewardInfo memory userRewardInformation;
                    userRewardInformation
                        .rewardTokenAddress = vTokenRewardAddresses[j];

                    userRewardInformation
                        .tokenIncentivesUserIndex = vTokenIncentiveController
                        .getUserAssetIndex(
                            user,
                            baseData.variableDebtTokenAddress,
                            userRewardInformation.rewardTokenAddress
                        );

                    userRewardInformation
                        .userUnclaimedRewards = vTokenIncentiveController
                        .getUserAccruedRewards(
                            user,
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation.rewardTokenDecimals = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).decimals();
                    userRewardInformation.rewardTokenSymbol = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).symbol();

                    // Get price of reward token from Chainlink Proxy Oracle
                    userRewardInformation
                        .rewardOracleAddress = vTokenIncentiveController
                        .getRewardOracle(
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation
                        .priceFeedDecimals = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).decimals();
                    userRewardInformation.rewardPriceFeed = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).latestAnswer();

                    vUserRewardsInformation[j] = userRewardInformation;
                }

                userReservesIncentivesData[i]
                    .vTokenIncentivesUserData = UserIncentiveData(
                    baseData.variableDebtTokenAddress,
                    address(aTokenIncentiveController),
                    vUserRewardsInformation
                );
            }

            // stable debt token
            IRewardsController sTokenIncentiveController = IRewardsController(
                address(
                    IncentivizedERC20(baseData.stableDebtTokenAddress)
                        .getIncentivesController()
                )
            );
            if (address(sTokenIncentiveController) != address(0)) {
                // get all rewards information from the asset
                address[]
                    memory sTokenRewardAddresses = sTokenIncentiveController
                        .getRewardsByAsset(baseData.stableDebtTokenAddress);
                UserRewardInfo[]
                    memory sUserRewardsInformation = new UserRewardInfo[](
                        sTokenRewardAddresses.length
                    );
                for (uint256 j = 0; j < sTokenRewardAddresses.length; ++j) {
                    UserRewardInfo memory userRewardInformation;
                    userRewardInformation
                        .rewardTokenAddress = sTokenRewardAddresses[j];

                    userRewardInformation
                        .tokenIncentivesUserIndex = sTokenIncentiveController
                        .getUserAssetIndex(
                            user,
                            baseData.stableDebtTokenAddress,
                            userRewardInformation.rewardTokenAddress
                        );

                    userRewardInformation
                        .userUnclaimedRewards = sTokenIncentiveController
                        .getUserAccruedRewards(
                            user,
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation.rewardTokenDecimals = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).decimals();
                    userRewardInformation.rewardTokenSymbol = IERC20Detailed(
                        userRewardInformation.rewardTokenAddress
                    ).symbol();

                    // Get price of reward token from Chainlink Proxy Oracle
                    userRewardInformation
                        .rewardOracleAddress = sTokenIncentiveController
                        .getRewardOracle(
                            userRewardInformation.rewardTokenAddress
                        );
                    userRewardInformation
                        .priceFeedDecimals = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).decimals();
                    userRewardInformation.rewardPriceFeed = IEACAggregatorProxy(
                        userRewardInformation.rewardOracleAddress
                    ).latestAnswer();

                    sUserRewardsInformation[j] = userRewardInformation;
                }

                userReservesIncentivesData[i]
                    .sTokenIncentivesUserData = UserIncentiveData(
                    baseData.stableDebtTokenAddress,
                    address(aTokenIncentiveController),
                    sUserRewardsInformation
                );
            }
        }

        return (userReservesIncentivesData);
    }
}
