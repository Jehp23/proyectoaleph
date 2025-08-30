// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MockOracle.sol";

/**
 * @title VaultManager
 * @dev Core vault management contract for CauciónBTC
 */
contract VaultManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Constants
    uint256 public constant LTV_MAX = 60; // 60% max LTV
    uint256 public constant LIQUIDATION_THRESHOLD = 70; // 70% liquidation threshold
    uint256 public constant LIQUIDATION_BONUS = 10; // 10% liquidation bonus
    uint256 public constant APR_BPS = 1200; // 12% APR in basis points
    uint256 public constant PRECISION = 1e18;
    uint256 public constant PRICE_PRECISION = 1e8; // Oracle price precision
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    // Tokens
    IERC20 public immutable wbtc;
    IERC20 public immutable musd;
    MockOracle public immutable oracle;

    // Vault structure
    struct Vault {
        uint256 collateralAmount; // WBTC amount in wei
        uint256 debtAmount; // mUSD amount in wei
        uint256 lastInterestUpdate; // Last interest accrual timestamp
        uint256 accruedInterest; // Accrued interest in mUSD wei
        bool isActive;
    }

    // State
    mapping(address => Vault) public vaults;
    uint256 public totalCollateral;
    uint256 public totalDebt;
    uint256 public vaultCount;

    // Events
    event VaultCreated(address indexed user);
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event DebtBorrowed(address indexed user, uint256 amount);
    event DebtRepaid(address indexed user, uint256 amount);
    event VaultLiquidated(address indexed user, address indexed liquidator, uint256 repayAmount, uint256 collateralSeized);
    event InterestAccrued(address indexed user, uint256 interest);

    constructor(
        address _wbtc,
        address _musd,
        address _oracle
    ) Ownable(msg.sender) {
        require(_wbtc != address(0), "VaultManager: Invalid WBTC address");
        require(_musd != address(0), "VaultManager: Invalid mUSD address");
        require(_oracle != address(0), "VaultManager: Invalid oracle address");
        
        wbtc = IERC20(_wbtc);
        musd = IERC20(_musd);
        oracle = MockOracle(_oracle);
    }

    /**
     * @dev Deposit WBTC as collateral
     */
    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "VaultManager: Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        if (!vault.isActive) {
            vault.isActive = true;
            vault.lastInterestUpdate = block.timestamp;
            vaultCount++;
            emit VaultCreated(msg.sender);
        }

        wbtc.safeTransferFrom(msg.sender, address(this), amount);
        vault.collateralAmount += amount;
        totalCollateral += amount;

        emit CollateralDeposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw WBTC collateral
     */
    function withdrawCollateral(uint256 amount) external nonReentrant {
        Vault storage vault = vaults[msg.sender];
        require(vault.isActive, "VaultManager: Vault not active");
        require(amount > 0, "VaultManager: Amount must be greater than 0");
        require(vault.collateralAmount >= amount, "VaultManager: Insufficient collateral");

        _accrueInterest(msg.sender);

        // Check health factor after withdrawal
        uint256 newCollateral = vault.collateralAmount - amount;
        if (vault.debtAmount + vault.accruedInterest > 0) {
            uint256 healthFactor = _calculateHealthFactor(newCollateral, vault.debtAmount + vault.accruedInterest);
            require(healthFactor >= 120, "VaultManager: Health factor too low"); // 1.2 minimum
        }

        vault.collateralAmount = newCollateral;
        totalCollateral -= amount;
        wbtc.safeTransfer(msg.sender, amount);

        emit CollateralWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Borrow mUSD against collateral
     */
    function borrow(uint256 amount) external nonReentrant {
        Vault storage vault = vaults[msg.sender];
        require(vault.isActive, "VaultManager: Vault not active");
        require(amount > 0, "VaultManager: Amount must be greater than 0");
        require(vault.collateralAmount > 0, "VaultManager: No collateral deposited");

        _accrueInterest(msg.sender);

        uint256 newDebt = vault.debtAmount + vault.accruedInterest + amount;
        uint256 ltv = _calculateLTV(vault.collateralAmount, newDebt);
        require(ltv <= LTV_MAX, "VaultManager: LTV exceeds maximum");

        vault.debtAmount = newDebt;
        vault.accruedInterest = 0;
        totalDebt += amount;

        musd.safeTransfer(msg.sender, amount);
        emit DebtBorrowed(msg.sender, amount);
    }

    /**
     * @dev Repay mUSD debt
     */
    function repay(uint256 amount) external nonReentrant {
        Vault storage vault = vaults[msg.sender];
        require(vault.isActive, "VaultManager: Vault not active");
        require(amount > 0, "VaultManager: Amount must be greater than 0");

        _accrueInterest(msg.sender);

        uint256 totalOwed = vault.debtAmount + vault.accruedInterest;
        require(totalOwed > 0, "VaultManager: No debt to repay");

        uint256 repayAmount = amount > totalOwed ? totalOwed : amount;
        musd.safeTransferFrom(msg.sender, address(this), repayAmount);

        if (repayAmount >= totalOwed) {
            vault.debtAmount = 0;
            vault.accruedInterest = 0;
        } else {
            // Repay interest first, then principal
            if (repayAmount >= vault.accruedInterest) {
                vault.debtAmount -= (repayAmount - vault.accruedInterest);
                vault.accruedInterest = 0;
            } else {
                vault.accruedInterest -= repayAmount;
            }
        }

        totalDebt -= (repayAmount > totalDebt ? totalDebt : repayAmount);
        emit DebtRepaid(msg.sender, repayAmount);
    }

    /**
     * @dev Liquidate an unhealthy vault
     */
    function liquidate(address user, uint256 repayAmount) external nonReentrant {
        Vault storage vault = vaults[user];
        require(vault.isActive, "VaultManager: Vault not active");
        require(repayAmount > 0, "VaultManager: Repay amount must be greater than 0");

        _accrueInterest(user);

        uint256 totalOwed = vault.debtAmount + vault.accruedInterest;
        require(totalOwed > 0, "VaultManager: No debt to liquidate");

        uint256 healthFactor = _calculateHealthFactor(vault.collateralAmount, totalOwed);
        require(healthFactor < 100, "VaultManager: Vault is healthy");

        uint256 maxRepay = totalOwed / 2; // Max 50% liquidation
        uint256 actualRepay = repayAmount > maxRepay ? maxRepay : repayAmount;

        // Calculate collateral to seize (with bonus)
        uint256 wbtcPrice = oracle.getPrice(address(wbtc));
        uint256 collateralValue = actualRepay * PRICE_PRECISION / wbtcPrice;
        uint256 bonusCollateral = collateralValue * LIQUIDATION_BONUS / 100;
        uint256 totalCollateralSeized = collateralValue + bonusCollateral;

        require(vault.collateralAmount >= totalCollateralSeized, "VaultManager: Insufficient collateral");

        // Transfer repayment from liquidator
        musd.safeTransferFrom(msg.sender, address(this), actualRepay);

        // Update vault state
        if (actualRepay >= vault.accruedInterest) {
            vault.debtAmount -= (actualRepay - vault.accruedInterest);
            vault.accruedInterest = 0;
        } else {
            vault.accruedInterest -= actualRepay;
        }
        vault.collateralAmount -= totalCollateralSeized;

        // Update global state
        totalDebt -= actualRepay;
        totalCollateral -= totalCollateralSeized;

        // Transfer collateral to liquidator
        wbtc.safeTransfer(msg.sender, totalCollateralSeized);

        emit VaultLiquidated(user, msg.sender, actualRepay, totalCollateralSeized);
    }

    /**
     * @dev Close vault (repay all debt and withdraw all collateral)
     */
    function closeVault() external nonReentrant {
        Vault storage vault = vaults[msg.sender];
        require(vault.isActive, "VaultManager: Vault not active");

        _accrueInterest(msg.sender);

        uint256 totalOwed = vault.debtAmount + vault.accruedInterest;
        if (totalOwed > 0) {
            musd.safeTransferFrom(msg.sender, address(this), totalOwed);
            totalDebt -= totalOwed;
        }

        uint256 collateralToReturn = vault.collateralAmount;
        if (collateralToReturn > 0) {
            totalCollateral -= collateralToReturn;
            wbtc.safeTransfer(msg.sender, collateralToReturn);
        }

        // Reset vault
        vault.collateralAmount = 0;
        vault.debtAmount = 0;
        vault.accruedInterest = 0;
        vault.isActive = false;
        vaultCount--;
    }

    /**
     * @dev Calculate LTV ratio
     */
    function _calculateLTV(uint256 collateralAmount, uint256 debtAmount) internal view returns (uint256) {
        if (collateralAmount == 0) return 0;
        
        uint256 wbtcPrice = oracle.getPrice(address(wbtc));
        uint256 collateralValueUSD = collateralAmount * wbtcPrice / PRICE_PRECISION;
        
        return debtAmount * 100 / collateralValueUSD;
    }

    /**
     * @dev Calculate health factor (liquidation threshold / LTV)
     */
    function _calculateHealthFactor(uint256 collateralAmount, uint256 debtAmount) internal view returns (uint256) {
        if (debtAmount == 0) return type(uint256).max;
        
        uint256 wbtcPrice = oracle.getPrice(address(wbtc));
        uint256 collateralValueUSD = collateralAmount * wbtcPrice / PRICE_PRECISION;
        uint256 liquidationValue = collateralValueUSD * LIQUIDATION_THRESHOLD / 100;
        
        return liquidationValue * 100 / debtAmount;
    }

    /**
     * @dev Accrue interest for a vault
     */
    function _accrueInterest(address user) internal {
        Vault storage vault = vaults[user];
        if (vault.debtAmount == 0 || !vault.isActive) return;

        uint256 timeElapsed = block.timestamp - vault.lastInterestUpdate;
        if (timeElapsed == 0) return;

        uint256 interest = vault.debtAmount * APR_BPS * timeElapsed / (10000 * SECONDS_PER_YEAR);
        vault.accruedInterest += interest;
        vault.lastInterestUpdate = block.timestamp;

        emit InterestAccrued(user, interest);
    }

    // View functions
    function getVaultData(address user) external view returns (
        uint256 collateralAmount,
        uint256 debtAmount,
        uint256 accruedInterest,
        uint256 ltv,
        uint256 healthFactor,
        uint256 liquidationPrice,
        bool isActive
    ) {
        Vault storage vault = vaults[user];
        
        // Calculate current interest
        uint256 currentInterest = vault.accruedInterest;
        if (vault.debtAmount > 0 && vault.isActive) {
            uint256 timeElapsed = block.timestamp - vault.lastInterestUpdate;
            currentInterest += vault.debtAmount * APR_BPS * timeElapsed / (10000 * SECONDS_PER_YEAR);
        }

        uint256 totalDebt = vault.debtAmount + currentInterest;
        
        return (
            vault.collateralAmount,
            vault.debtAmount,
            currentInterest,
            vault.collateralAmount > 0 ? _calculateLTV(vault.collateralAmount, totalDebt) : 0,
            totalDebt > 0 ? _calculateHealthFactor(vault.collateralAmount, totalDebt) : type(uint256).max,
            vault.collateralAmount > 0 && totalDebt > 0 ? totalDebt * PRICE_PRECISION * 100 / (vault.collateralAmount * LIQUIDATION_THRESHOLD) : 0,
            vault.isActive
        );
    }

    function getProtocolData() external view returns (
        uint256 _totalCollateral,
        uint256 _totalDebt,
        uint256 _vaultCount,
        uint256 wbtcPrice
    ) {
        return (
            totalCollateral,
            totalDebt,
            vaultCount,
            oracle.getPrice(address(wbtc))
        );
    }
}
