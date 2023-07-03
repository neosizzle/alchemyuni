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

contract UiIncentiveDataProviderAdapter is IUiIncentiveDataProviderV3 {
    using UserConfiguration for DataTypes.UserConfigurationMap;
    using SafeMath for uint256;

    ChefIncentivesController public chefIncentivesController =
        ChefIncentivesController(0x12aA80Aa896407C8b1c12f3E3fCEDA0302e05f81);
    address public nativeTokenAddress =
        0xB549De8ae19936f044C4A489051456D8403f71eC;
    address public nativeTokenOracle =
        0xdCBfB133F9c786eaE645928C8318ffa068e24bd2;

    function getFullReservesIncentiveData(
        IPoolAddressesProvider provider,
        address user
    )
        external
        view
        override
        returns (
            AggregatedReserveIncentiveData[] memory,
            UserReserveIncentiveData[] memory
        )
    {
        return (
            _getReservesIncentivesData(provider),
            _getUserReservesIncentivesData(provider, user)
        );
    }

    function getReservesIncentivesData(
        IPoolAddressesProvider provider
    ) external view override returns (AggregatedReserveIncentiveData[] memory) {
        return _getReservesIncentivesData(provider);
    }

    function _getReservesIncentivesData(
        IPoolAddressesProvider provider
    ) private view returns (AggregatedReserveIncentiveData[] memory) {
        //Get pool
        IPool pool = IPool(provider.getPool());

        //Get pool reserves list
        address[] memory reserves = pool.getReservesList();

        //Create AggregatedReserveIncentiveData Array on memory based on reserves length
        AggregatedReserveIncentiveData[]
            memory reserveIncentiveDataArray = new AggregatedReserveIncentiveData[](
                reserves.length
            );

        // Iterate through the reserves to get all the information from the (a/s/v) Tokens

        for (uint256 i = 0; i < reserves.length; i++) {
            AggregatedReserveIncentiveData
                memory reserveIncentiveData = reserveIncentiveDataArray[i];
            reserveIncentiveData.underlyingAsset = reserves[i];

            // baseData is the information of aToken, vToken & sToken of an underlying asset
            DataTypes.ReserveData memory baseData = pool.getReserveData(
                reserves[i]
            );

            reserveIncentiveData.aIncentiveData = _getTokenIncentiveData(
                baseData.aTokenAddress
            );
            reserveIncentiveData.vIncentiveData = _getTokenIncentiveData(
                baseData.variableDebtTokenAddress
            );
            reserveIncentiveData.sIncentiveData = _getTokenIncentiveData(
                baseData.stableDebtTokenAddress
            );
        }
        return (reserveIncentiveDataArray);
    }

    //sub function of _getReservesIncentivesData
    function _getTokenIncentiveData(
        address _avsTokenAddress
    ) internal view returns (IncentiveData memory) {
        IncentiveData memory tokenIncentiveData;

        //Assign asset address & incentivesController
        tokenIncentiveData.tokenAddress = _avsTokenAddress;
        tokenIncentiveData.incentiveControllerAddress = address(
            chefIncentivesController
        );

        //Get total rewards minted per second by chefIncentivesController
        uint256 incentiveRewardsPerSecond = chefIncentivesController
            .rewardsPerSecond();

        //Get total allocPoint in chefIncentivesController
        uint256 incentiveTotalAllocPoint = chefIncentivesController
            .totalAllocPoint();
        //Get asset allocPoint and last updated reward time
        (
            ,
            uint256 assetAllocPoint,
            uint256 assetLastRewardTime,
            ,

        ) = chefIncentivesController.poolInfo(_avsTokenAddress);

        //Create RewardInfo array
        tokenIncentiveData.rewardsTokenInformation = new RewardInfo[](1);

        //Assign information to RewardInfo
        tokenIncentiveData.rewardsTokenInformation[0].rewardTokenSymbol = "PAW";
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .rewardTokenAddress = nativeTokenAddress;
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .rewardOracleAddress = nativeTokenOracle;
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .emissionPerSecond = incentiveRewardsPerSecond
            .mul(assetAllocPoint)
            .div(incentiveTotalAllocPoint);
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .incentivesLastUpdateTimestamp = assetLastRewardTime;
        tokenIncentiveData.rewardsTokenInformation[0].tokenIncentivesIndex = 0;
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .rewardPriceFeed = IEACAggregatorProxy(nativeTokenOracle)
            .latestAnswer();
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .rewardTokenDecimals = IERC20Detailed(nativeTokenAddress)
            .decimals();
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .precision = IERC20Detailed(_avsTokenAddress).decimals();
        tokenIncentiveData
            .rewardsTokenInformation[0]
            .priceFeedDecimals = IEACAggregatorProxy(nativeTokenOracle)
            .decimals();

        return tokenIncentiveData;
    }

    function getUserReservesIncentivesData(
        IPoolAddressesProvider provider,
        address user
    ) external view override returns (UserReserveIncentiveData[] memory) {
        return _getUserReservesIncentivesData(provider, user);
    }

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
            userReservesIncentivesData[i].underlyingAsset = reserves[i];
            userReservesIncentivesData[i]
                .aTokenIncentivesUserData = _getUserIndividualReserveIncentivesData(
                baseData.aTokenAddress
            );
            userReservesIncentivesData[i]
                .vTokenIncentivesUserData = _getUserIndividualReserveIncentivesData(
                baseData.variableDebtTokenAddress
            );
            userReservesIncentivesData[i]
                .sTokenIncentivesUserData = _getUserIndividualReserveIncentivesData(
                baseData.stableDebtTokenAddress
            );
        }

        return userReservesIncentivesData;
    }

    function _getUserIndividualReserveIncentivesData(
        address _avsTokenAddress
    ) private view returns (UserIncentiveData memory) {
        UserIncentiveData memory userIncentiveData;

        //Assign asset address & incentivesController
        userIncentiveData.tokenAddress = _avsTokenAddress;
        userIncentiveData.incentiveControllerAddress = address(
            chefIncentivesController
        );

        //Create UserRewardInfo array
        userIncentiveData.userRewardsInformation = new UserRewardInfo[](1);

        //Assign information to UserRewardInfo
        userIncentiveData.userRewardsInformation[0].rewardTokenSymbol = "PAW";
        userIncentiveData
            .userRewardsInformation[0]
            .rewardOracleAddress = nativeTokenOracle;
        userIncentiveData
            .userRewardsInformation[0]
            .rewardTokenAddress = nativeTokenAddress;

        userIncentiveData
            .userRewardsInformation[0]
            .rewardPriceFeed = IEACAggregatorProxy(nativeTokenOracle)
            .latestAnswer();
        userIncentiveData
            .userRewardsInformation[0]
            .priceFeedDecimals = IEACAggregatorProxy(nativeTokenOracle)
            .decimals();
        userIncentiveData
            .userRewardsInformation[0]
            .rewardTokenDecimals = IERC20Detailed(nativeTokenAddress)
            .decimals();

        return userIncentiveData;
    }
}
