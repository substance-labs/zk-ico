// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/Vault.sol";

contract VaultScript is Script {
    Vault public vault;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        // ...
        vm.stopBroadcast();
    }
}
