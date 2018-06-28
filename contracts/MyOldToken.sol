pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

contract MyOldToken is StandardToken, DetailedERC20 {

  function MyOldToken(string _name, string _symbol, uint8 _decimals, uint256 _totalSupply)
  DetailedERC20(_name, _symbol, _decimals)
  public
  {
    totalSupply_ = _totalSupply;
    balances[msg.sender] = _totalSupply;
  }
}
