// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZkIcoToken is ERC20 {
    constructor(string memory name, string memory symbol, address to, uint256 amount) ERC20(name, symbol) {
        _mint(to, amount);
    }
}
