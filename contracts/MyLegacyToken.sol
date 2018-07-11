pragma solidity ^0.4.21;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";

contract MyLegacyToken is StandardToken, DetailedERC20 {
  uint256 private constant INITIAL_SUPPLY = 100;

  function MyLegacyToken(string _name, string _symbol, uint8 _decimals) DetailedERC20(_name, _symbol, _decimals) public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}
