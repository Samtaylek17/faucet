// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Faucet {
  /**
    this is a special function. It's called when you
    make a transaction that doesn't specify function
    name to call
 
    External function are part of the contract interface
    which means they can be called via contracts and other transactions
   */
  // address[] public funders;
  uint public numOfFunders;
  // mapping(uint => address) private funders;
  mapping(address => bool) private funders;
  mapping(uint => address) private lutFunders;

  receive() external payable {}

  function addFunds() external payable {
    // funders.push(msg.sender);
    // funders[index] = msg.sender;
    address funder = msg.sender;

    if(!funders[funder]) {
      uint index = numOfFunders++;
      // numOfFunders++;
      funders[funder] = true;
      lutFunders[index] = funder;
    }
  }

  function getAllFunders() external view returns (address[] memory) {
    address[] memory _funders = new address[](numOfFunders);

    for (uint i = 0; i < numOfFunders; i++) {
      _funders[i] = lutFunders[i];
    }

    return _funders;
  }

  function getFunderAtIndex(uint8 index) external view returns(address) {
    // address[] memory _funders = getAllFunders();
    return lutFunders[index];
  }
}

// const instance = await Faucet.deployed();
// instance.addFunds({from: accounts[0], value: "200000000"})
// instance.addFunds({from: accounts[1], value: "200000000"})
// instance.getFunderAtIndex(0)
// instance.getAllFunders()