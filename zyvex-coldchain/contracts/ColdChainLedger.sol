// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/// @title ColdChainLedger
/// @notice Anchors a shipment batch SHA-256 digest on an EVM-compatible chain.
contract ColdChainLedger {
    struct Anchor { uint64 timestamp; address sender; }
    mapping(bytes32 => Anchor) public anchors;
    event BatchAnchored(bytes32 indexed batchHash, address indexed sender, uint256 timestamp);
    function anchor(bytes32 batchHash) external {
        require(batchHash != bytes32(0), "Empty hash");
        require(anchors[batchHash].timestamp == 0, "Already anchored");
        anchors[batchHash] = Anchor(uint64(block.timestamp), msg.sender);
        emit BatchAnchored(batchHash, msg.sender, block.timestamp);
    }
    function verify(bytes32 batchHash) external view returns (bool exists, uint256 timestamp, address sender) {
        Anchor memory a = anchors[batchHash];
        return (a.timestamp != 0, a.timestamp, a.sender);
    }
}
