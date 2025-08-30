// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20{function transfer(address,uint256) external returns(bool);function transferFrom(address,address,uint256) external returns(bool);}
library SafeERC20{function safeTransfer(IERC20 t,address to,uint256 v) internal {require(t.transfer(to,v),"ERC20: transfer failed");}function safeTransferFrom(IERC20 t,address f,address to,uint256 v) internal {require(t.transferFrom(f,to,v),"ERC20: transferFrom failed");}}
abstract contract ReentrancyGuard{uint256 private constant _E=2;uint256 private constant _N=1;uint256 private _s=_N;modifier nonReentrant(){require(_s==_N,"reentrant");_s=_E;_;_s=_N;}}

contract P2PSecuredLoan is ReentrancyGuard{
    using SafeERC20 for IERC20;
    enum State{Preparing,Funding,Funded,Repaid,Defaulted,Canceled}
    IERC20 public immutable stable; IERC20 public immutable collateral; address public immutable borrower; address public lender;
    uint256 public immutable loanAmount; uint256 public immutable interestAmount; uint256 public immutable collateralAmount;
    uint256 public immutable fundingDeadline; uint256 public immutable dueDate;
    State public state=State.Preparing; bool public fundsWithdrawn; bool public repaymentClaimed; bool public collateralClaimed; bool public collateralReturned;
    event CollateralDeposited(address indexed borrower,uint256 amount);event Funded(address indexed lender,uint256 amount);event BorrowerWithdraw(address indexed borrower,uint256 amount);
    event Repaid(address indexed borrower,uint256 amount);event RepaymentClaimed(address indexed lender,uint256 amount);event Defaulted();event CollateralClaimed(address indexed lender,uint256 amount);
    event CollateralReturned(address indexed borrower,uint256 amount);event Canceled();
    constructor(IERC20 stable_,IERC20 collateral_,address borrower_,uint256 loanAmount_,uint256 interestAmount_,uint256 collateralAmount_,uint256 fundingDeadline_,uint256 dueDate_){
        require(address(stable_)!=address(0)&&address(collateral_)!=address(0)&&borrower_!=address(0),"zero");
        require(loanAmount_>0&&collateralAmount_>0,"amounts=0");require(fundingDeadline_>=block.timestamp,"fundingDeadline past");require(dueDate_>fundingDeadline_,"dueDate<=fundingDeadline");
        stable=stable_;collateral=collateral_;borrower=borrower_;loanAmount=loanAmount_;interestAmount=interestAmount_;collateralAmount=collateralAmount_;fundingDeadline=fundingDeadline_;dueDate=dueDate_;
    }
    function depositCollateral() external nonReentrant {require(msg.sender==borrower,"only borrower");require(state==State.Preparing,"bad state");collateral.safeTransferFrom(msg.sender,address(this),collateralAmount);state=State.Funding;emit CollateralDeposited(msg.sender,collateralAmount);}
    function fund(uint256 amount) external nonReentrant {require(state==State.Funding,"not Funding");require(block.timestamp<=fundingDeadline,"funding ended");require(lender==address(0),"already funded");require(amount==loanAmount,"need exact loanAmount");lender=msg.sender;stable.safeTransferFrom(msg.sender,address(this),amount);state=State.Funded;emit Funded(msg.sender,amount);}
    function withdrawToBorrower() external nonReentrant {require(msg.sender==borrower,"only borrower");require(state==State.Funded,"not Funded");require(!fundsWithdrawn,"already withdrawn");fundsWithdrawn=true;stable.safeTransfer(msg.sender,loanAmount);emit BorrowerWithdraw(msg.sender,loanAmount);}
    function repay() external nonReentrant {require(msg.sender==borrower,"only borrower");require(state==State.Funded,"not Funded");require(block.timestamp<=dueDate,"past due");uint256 r=loanAmount+interestAmount;stable.safeTransferFrom(msg.sender,address(this),r);state=State.Repaid;emit Repaid(msg.sender,r);}
    function claimRepayment() external nonReentrant {require(state==State.Repaid,"not Repaid");require(msg.sender==lender,"only lender");require(!repaymentClaimed,"claimed");repaymentClaimed=true;stable.safeTransfer(msg.sender,loanAmount+interestAmount);emit RepaymentClaimed(msg.sender,loanAmount+interestAmount);}
    function markDefault() external {require(state==State.Funded,"not Funded");require(block.timestamp>dueDate,"not due");state=State.Defaulted;emit Defaulted();}
    function claimCollateral() external nonReentrant {require(state==State.Defaulted,"not Defaulted");require(msg.sender==lender,"only lender");require(!collateralClaimed,"claimed");collateralClaimed=true;collateral.safeTransfer(msg.sender,collateralAmount);emit CollateralClaimed(msg.sender,collateralAmount);}
    function cancelFundingIfExpired() external {require(state==State.Funding,"not Funding");require(block.timestamp>fundingDeadline,"not expired");state=State.Canceled;emit Canceled();}
    function withdrawCollateralAfterRepaidOrCanceled() external nonReentrant {require(msg.sender==borrower,"only borrower");require(!collateralReturned,"returned");require(state==State.Repaid||state==State.Canceled,"not allowed");collateralReturned=true;collateral.safeTransfer(msg.sender,collateralAmount);emit CollateralReturned(msg.sender,collateralAmount);}
    function currentState() external view returns(State){return state;}
}
