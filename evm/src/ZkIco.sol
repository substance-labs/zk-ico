// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {OrderEncoder, OrderData} from "./libs/OrderEncoder.sol";
import {StringUtils} from "./libs/StringUtils.sol";
import {IHook7683Recipient} from "./interfaces/IHook7683Recipient.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ProofType, ProofVerificationParams, IZKPassportVerifier} from "./interfaces/IZKPassportVerifier.sol";
import {IOriginSettler, OnchainCrossChainOrder} from "./interfaces/IERC7683.sol";

contract ZkIco is IHook7683Recipient {
    uint256 public immutable VERSION = uint256(keccak256(abi.encodePacked("test_1")));
    address public immutable GATEWAY;
    address public immutable BUY_TOKEN;
    bytes32 public immutable AZTEC_BUY_TOKEN;
    address public immutable ICO_TOKEN;
    address public immutable VERIFIER;
    uint256 public immutable RATE;
    string public TITLE;
    string public DESCRIPTION;

    mapping(bytes32 => uint256) public finalizableDeposits;
    mapping(bytes32 => bool) public consumedProofs;
    mapping(address => uint256) public amounts;

    event NewOrderToFinalize(bytes32 depositCommitment, uint256 amount);
    event NewZkIcoCampaign(uint256 version, address zkIco);

    constructor(
        address gateway,
        bytes32 aztecBuyToken,
        address buyToken,
        address icoToken,
        address verifier,
        uint256 rate,
        string memory title,
        string memory description
    ) {
        GATEWAY = gateway;
        AZTEC_BUY_TOKEN = aztecBuyToken;
        BUY_TOKEN = buyToken;
        ICO_TOKEN = icoToken;
        VERIFIER = verifier;
        RATE = rate;
        TITLE = title;
        DESCRIPTION = description;

        emit NewZkIcoCampaign(VERSION, address(this));
    }

    function finalizeOrder( /*ProofVerificationParams calldata proofParams*/ bytes calldata proofParams, address owner)
        external
    {
        /*require(!proofParams.devMode, "invalid dev mode proof");
        bytes32 proofCommitment = keccak256(abi.encode(proofParams));
        require(!consumedProofs[proofCommitment], "proof already used");
        consumedProofs[proofCommitment] = true;

        (bool verified,) = IZKPassportVerifier(VERIFIER).verifyProof(proofParams);
        require(verified, "proof is invalid");

        require(
            IZKPassportVerifier(VERIFIER).verifyScopes(proofParams.publicInputs, "your-domain.com", "my-scope"),
            "invalid scope"
        );

        (uint256 currentDate, uint8 minAge, uint8 maxAge) = IZKPassportVerifier(VERIFIER).getAgeProofInputs(
            proofParams.committedInputs, proofParams.committedInputCounts
        );
        require(block.timestamp >= currentDate, "date used in proof is in the future");
        require(minAge == 18 && maxAge == 0, "user needs to be above 18");

        string[] memory nationalityExclusionList = IZKPassportVerifier(VERIFIER).getCountryProofInputs(
            proofParams.committedInputs, proofParams.committedInputCounts, ProofType.NATIONALITY_EXCLUSION
        );

        // NOTE: check that the user is not from North Korea
        require(
            nationalityExclusionList.length == 1 && StringUtils.equals(nationalityExclusionList[0], "KP"),
            "not the expected exclusion list"
        );

        bytes memory data = IZKPassportVerifier(VERIFIER).getBindProofInputs(
            proofParams.committedInputs, proofParams.committedInputCounts
        );
        (address userAddress,) = IZKPassportVerifier(VERIFIER).getBoundData(data);*/

        bytes32 depositCommitment = keccak256(abi.encode(proofParams));
        uint256 amount = finalizableDeposits[depositCommitment];
        require(amount > 0, "deposit not finalizable");

        IERC20Metadata(ICO_TOKEN).transfer(owner, amount);
    }

    function getDetails()
        external
        view
        returns (
            string memory,
            string memory,
            bytes32,
            address,
            string memory,
            string memory,
            address,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            TITLE,
            DESCRIPTION,
            AZTEC_BUY_TOKEN,
            BUY_TOKEN,
            IERC20Metadata(BUY_TOKEN).name(),
            IERC20Metadata(BUY_TOKEN).symbol(),
            ICO_TOKEN,
            IERC20Metadata(ICO_TOKEN).name(),
            IERC20Metadata(ICO_TOKEN).symbol(),
            RATE
        );
    }

    function onFilledOrder(OrderData calldata orderData) external {
        require(msg.sender == GATEWAY, "not gateway");
        require(orderData.inputToken == AZTEC_BUY_TOKEN, "invalid aztec buy token");
        require(_bytes32ToAddress(orderData.outputToken) == BUY_TOKEN, "invalid buy token");

        bytes32 depositCommitment = orderData.data; // keccak256(abi.encode(proofParams));
        require(finalizableDeposits[depositCommitment] == 0, "deposit commitment already used");

        uint256 amount = (orderData.amountOut * RATE) / 10 ** 18;
        finalizableDeposits[depositCommitment] = amount;
        emit NewOrderToFinalize(depositCommitment, amount);
    }

    function _bytes32ToAddress(bytes32 buf) internal pure returns (address) {
        return address(uint160(uint256(buf)));
    }
}
