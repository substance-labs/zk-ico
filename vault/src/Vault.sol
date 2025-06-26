// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {OrderEncoder, OrderData} from "./libs/OrderEncoder.sol";
import {IHook7683Recipient} from "./interfaces/IHook7683Recipient.sol";
import {IOriginSettler, OnchainCrossChainOrder} from "./interfaces/IERC7683.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault is IHook7683Recipient {
    address public immutable GATEWAY;
    address public immutable BUY_TOKEN;
    address public immutable ICO_TOKEN;
    uint256 public immutable RATE;

    mapping(bytes32 => uint256) public finalizableDeposits;
    mapping(bytes32 => bool) public consumedProofs;
    mapping(address => uint256) public amounts;

    event NewOrderToFinalize(bytes32 depositCommitment, uint256 amount);

    constructor(address gateway, address buyToken, address icoToken, uint256 rate) {
        GATEWAY = gateway;
        BUY_TOKEN = buyToken;
        ICO_TOKEN = icoToken;
        RATE = rate;
    }

    function finalizeOrder(bytes calldata proof, address owner) external {
        bytes32 proofCommitment = keccak256(proof);
        require(!consumedProofs[proofCommitment], "proof already used");
        consumedProofs[proofCommitment] = true;

        bytes32 depositCommitment = keccak256(abi.encodePacked(proof, owner));
        uint256 amount = finalizableDeposits[depositCommitment];
        require(amount > 0, "deposit not finalizable");
        // TODO: verify zk passport proof

        IERC20(ICO_TOKEN).transfer(owner, amount);
    }

    function onFilledOrder(OrderData calldata orderData) external {
        require(msg.sender == GATEWAY, "not gateway");
        require(_bytes32ToAddress(orderData.outputToken) == BUY_TOKEN, "invalid buy token");

        bytes32 depositCommitment = orderData.data; // keccak256(abi.encodePacked(proof, owner));
        require(finalizableDeposits[depositCommitment] == 0, "deposit commitment already used");

        uint256 amount = (orderData.amountOut * RATE) / 10 ** 18;
        finalizableDeposits[depositCommitment] = amount;
        emit NewOrderToFinalize(depositCommitment, amount);
    }

    function _bytes32ToAddress(bytes32 buf) internal pure returns (address) {
        return address(uint160(uint256(buf)));
    }
}
