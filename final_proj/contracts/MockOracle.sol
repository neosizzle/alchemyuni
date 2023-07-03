// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.10;

contract MockOracle {
    uint8 public decimals;
    uint256 public latestAnswer;
    string public description;
    string public ticker;
    address public owner;

    constructor(
        string memory _description,
        string memory _ticker,
        uint8 _decimals,
        uint256 _latestAnswer
    ) {
        description = _description;
        ticker = _ticker;
        decimals = _decimals;
        latestAnswer = _latestAnswer;
        owner = msg.sender;
    }

    function updateDecimals(uint8 _updatedDecimals) external {
        decimals = _updatedDecimals;
    }

    function updateAnswer(uint256 _newAnswer) external {
        latestAnswer = _newAnswer;
    }
}
