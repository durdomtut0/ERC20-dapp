// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//UniswapV1Pair
//UniswapV2Pair
contract Exchange is ERC20 {//ERC20 as LP Tokens

    address public tokenAddress;
    //IERC20 public token;
   

    constructor(address _token) 
    ERC20(
        string(abi.encodePacked(ERC20(_token).name(), " LP Token")),
        string(abi.encodePacked(ERC20(_token).symbol(), " LP")))
    {
        //token = IERC20(_token);
        tokenAddress = _token;
        
    }

    function getReserve() public view returns (uint) {
        return ERC20(tokenAddress).balanceOf(address(this));
    }
    function addLiquidity(uint _amount ) public payable returns (uint){
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint tokenReserve = getReserve();
        ERC20 token = ERC20(tokenAddress);
        if (tokenReserve == 0){
            token.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        }
        else {
            uint ethReserve = ethBalance - msg.value;
            uint tokenAmount = (msg.value * tokenReserve)/ethReserve;
            require(_amount >= tokenAmount, "amount of token is less than minimum required");
            token.transferFrom(msg.sender, address(this), tokenAmount);
             liquidity = (totalSupply() * msg.value)/ ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }
    function removeLiquidity(uint _amount) public returns (uint, uint){
        require(_amount > 0, "_amount shoulf be >0");
        //require
        //revert (revert errors)
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply();
        uint ethAmount = (ethReserve * _amount)/_totalSupply;
        uint tokenAmount = (getReserve() * _amount)/_totalSupply;
        _burn (msg.sender, _amount);
        //address => address
        //payable => address 
        payable(msg.sender).transfer(ethAmount);
        ERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        return(ethAmount, tokenAmount);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256){
        require(inputReserve>0 && outputReserve>0, "invalid reserves");
        uint256 inputAmountWithFee = inputAmount*99;
        uint256 numerator = outputReserve * inputAmountWithFee;
        uint256 denominator = (inputReserve*100) +inputAmountWithFee;
        return numerator/denominator;
    }

    function ethToToken(uint _minTokens) public payable{
        uint256 tokenReserve = getReserve();
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            tokenReserve
        );
        require(tokensBought >= _minTokens, "insuffient output amount");
        ERC20(tokenAddress).transfer(msg.sender, tokensBought);

    }

    function tokenToEth(uint _tokensSold, uint _minEth) public{
        uint256 tokenReserve = getReserve();
        uint256 ethBought = getAmountOfTokens(
            _tokensSold,
            tokenReserve,
            address(this).balance
        );
        require(ethBought >= _minEth, "insufficient output amount");
        ERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );//transferFrom require Approve;

        payable(msg.sender).transfer(ethBought);
    }


}
