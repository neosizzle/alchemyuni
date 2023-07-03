// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.10;

import "./IPancakePair.sol";
import "./IAggregator.sol";
import "../core/dependencies/openzeppelin/contracts/IERC20.sol";
import "../core/dependencies/openzeppelin/contracts/SafeMath.sol";

/**
 * @title ProtocolTokenPriceAdapter
 * @author Maneki
 * @notice Contract to get the price of the native protocol token
 * - Used ONLY for Maneki frontend UI purpose
 * - IMPORTANT: Not safe for price feeding as it was subject to flash loan manipulation within same block
 */

contract ProtocolTokenPriceAdapter {
    using SafeMath for uint256;

    uint8 public decimals = 8;

    string public description = "PAW / USD";

    address public owner;

    address public nativeToken = 0xB549De8ae19936f044C4A489051456D8403f71eC;

    // address public wbnb = 0x69c5207A60C8e34311E44A2E10afa0CB4dbFC8df; //Testnet WBNB Maneki uses

    address public wbnb = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd; //Testnet WBNB Pancake uses

    address public OracleWbnb = 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526;

    address public liquidityPair = 0x48Cd1e002083b74272D4081d11242ed30660860b;

    uint256 public latestTimestamp;

    constructor() {
        owner = msg.sender;
        latestTimestamp = block.timestamp;
    }

    function latestAnswer() external view returns (int256) {
        uint256 liquidityWbnbBalance = IERC20(wbnb).balanceOf(liquidityPair);

        int256 priceOfWbnb = IAggregator(OracleWbnb).latestAnswer();

        uint256 liquidityProtocolTokenBalance = IERC20(nativeToken).balanceOf(
            liquidityPair
        );

        require(priceOfWbnb >= 0, "Error: Reference price less than 0");

        return
            int256(
                liquidityWbnbBalance.mul(uint256(priceOfWbnb)).div(
                    liquidityProtocolTokenBalance
                )
            );
    }
}
