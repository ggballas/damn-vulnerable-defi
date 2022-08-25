
// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

contract FakeGnosisSafe {
   
    address public immutable deployer;
    address private owner;

    event Called(uint256 a, address addr);

    constructor() {
        deployer = msg.sender;
    }

    function arbitrary(uint256 a) public {
        console.log("called %s %s", a, msg.sender);
        emit Called(a, msg.sender);
    }

    function setOwner(address addr) public {
        require(msg.sender == deployer);
        owner = addr;
    }

    function getOwners() public returns(address[1] memory) {
        return [owner];
    }
}