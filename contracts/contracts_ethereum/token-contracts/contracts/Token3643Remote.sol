// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./app/WmbApp.sol";
import "./interfaces/IToken.sol";

contract Token3643Remote is WmbApp {
    using SafeERC20 for IERC20;

    struct MessageData {
        address to;
        uint256 amount;
    }

    address public tokenAddress;
    address public homeAddress;
    uint256 public homeChainId;

    event SendTokenToHome(uint256 indexed homeChainId, address indexed from, address indexed to, uint256 amount);
    event ReceiveTokenFromHome(uint256 indexed fromChainId, address indexed from, address indexed to, uint256 amount);

    function initialize(
        address _admin,
        address _wmbGateway, 
        address _tokenAddress, 
        address _homeAddress, 
        uint256 _homeChainId
    ) public initializer {
        tokenAddress = _tokenAddress;
        homeAddress = _homeAddress;
        homeChainId = _homeChainId;
        
        __WmbApp_initialize(_admin, _wmbGateway);
    }

    function send(address to, uint256 amount) external {
        require(homeAddress != address(0), "homeAddress not set");
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid receiver address");

        IToken(tokenAddress).burn(msg.sender, amount);

        uint fee = estimateFee(homeChainId, 300_000);
        
        MessageData memory msgInfo;
        msgInfo.to = to;
        msgInfo.amount = amount;

        outboundCall(
            homeChainId,
            abi.encodePacked(homeAddress),
            abi.encode(msgInfo),
            fee
        );

        emit SendTokenToHome(homeChainId, msg.sender, to, amount);
    }

    function _wmbReceive(
        bytes calldata data
    ) override internal {
        MessageData memory messageData = abi.decode(data, (MessageData));

        IToken(tokenAddress).mint(messageData.to, messageData.amount);
        emit ReceiveTokenFromHome(homeChainId, tokenAddress, messageData.to, messageData.amount);
    }

}