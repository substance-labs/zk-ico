// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ZkIco} from "../src/ZkIco.sol";

contract ZkIcoScript is Script {
    ZkIco public vault;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        // ...
        vm.stopBroadcast();
    }
}
