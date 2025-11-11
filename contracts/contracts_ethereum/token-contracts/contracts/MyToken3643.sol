// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;



import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken3643 is ERC20 {
    constructor(uint256 initialSupply) ERC20("MyToken3643@ETH", "XTK-ETH") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}