// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Owned.sol";

contract Faucet is Owned {
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

  modifier limitWithdraw(uint withdrawAmount) {
    require(withdrawAmount < 1000000000000000000, "Cannot withdraw more than 0.1 ether "); 
    _;
  }

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

  function withdraw(uint withdrawAmount) external limitWithdraw(withdrawAmount)  {

    // require(withdrawAmount < 10000000000000 00000, "Cannot withdraw more than 0.1 ether "); 
    // if(withdrawAmount < 1000000000000000000){
      payable(msg.sender).transfer(withdrawAmount);
    // }
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
// instance.addFunds({from: accounts[0], value: "2000000000000000000"})
// instance.addFunds({from: accounts[1], value: "2000000000000000000"})
// instance.withdraw("5000000000000000000", {from: accounts[1]})
// instance.getFunderAtIndex(0)
// instance.getAllFunders()