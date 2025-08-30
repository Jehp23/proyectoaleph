// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockOracle
 * @dev Mock price oracle for demo purposes with manual price setting
 */
contract MockOracle is Ownable {
    mapping(address => uint256) private prices; // Price in E8 (8 decimals)
    mapping(address => uint256) private lastUpdated;

    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set price for a token (admin only for demo)
     * @param token Token address
     * @param price Price in E8 format (e.g., 4500000000000 for $45,000)
     */
    function setPrice(address token, uint256 price) external onlyOwner {
        require(price > 0, "MockOracle: Price must be greater than 0");
        prices[token] = price;
        lastUpdated[token] = block.timestamp;
        emit PriceUpdated(token, price, block.timestamp);
    }

    /**
     * @dev Get current price for a token
     * @param token Token address
     * @return price Price in E8 format
     */
    function getPrice(address token) external view returns (uint256 price) {
        price = prices[token];
        require(price > 0, "MockOracle: Price not set");
    }

    /**
     * @dev Get price with timestamp
     * @param token Token address
     * @return price Price in E8 format
     * @return updatedAt Last update timestamp
     */
    function getPriceWithTimestamp(address token) 
        external 
        view 
        returns (uint256 price, uint256 updatedAt) 
    {
        price = prices[token];
        require(price > 0, "MockOracle: Price not set");
        updatedAt = lastUpdated[token];
    }

    /**
     * @dev Simulate price drop for demo (reduces price by percentage)
     * @param token Token address
     * @param dropPercentage Percentage to drop (e.g., 10 for 10%)
     */
    function simulatePriceDrop(address token, uint256 dropPercentage) external onlyOwner {
        require(dropPercentage > 0 && dropPercentage <= 50, "MockOracle: Invalid drop percentage");
        uint256 currentPrice = prices[token];
        require(currentPrice > 0, "MockOracle: Price not set");
        
        uint256 newPrice = currentPrice * (100 - dropPercentage) / 100;
        prices[token] = newPrice;
        lastUpdated[token] = block.timestamp;
        emit PriceUpdated(token, newPrice, block.timestamp);
    }
}
