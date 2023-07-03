// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Haha is ERC20 {
    uint constant _initial_supply = 100 * (10**18);
    constructor() ERC20("Haha", "GG") {
        _mint(msg.sender, _initial_supply);
    }
}