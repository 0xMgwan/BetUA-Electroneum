// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract TestContract {
    uint256 public value;
    
    constructor() {
        value = 42;
    }
    
    function setValue(uint256 newValue) public {
        value = newValue;
    }
}
