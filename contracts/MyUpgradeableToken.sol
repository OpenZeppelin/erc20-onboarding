pragma solidity ^0.4.21;

import "./openzeppelin-zos/MigratableERC20.sol";
import "openzeppelin-zos/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-zos/contracts/token/ERC20/StandardToken.sol";

/**
 * @title MyUpgradeableToken
 * @dev This contract is a mock to test how a token could be migrated using the MigratableERC20 contract
 */
contract MyUpgradeableToken is MigratableERC20, StandardToken, DetailedERC20 {

  /**
   * @dev Initialization function. This function all the metadata required by the token contract.
   * @dev This function will call the MigratableERC20 and DetailedERC20 initializers.
   */
  function initialize(ERC20 _legacyToken, string _name, string _symbol, uint8 _decimals)
  isInitializer("MyUpgradeableToken", "1.0.0")
  public
  {
    MigratableERC20.initialize(_legacyToken);
    DetailedERC20.initialize(_name, _symbol, _decimals);
  }

  /**
   * @dev Internal minting function
   * This function will be removed in favour of our new upcoming version of StandardToken
   */
  function _mint(address _to, uint256 _amount) internal {
    require(_to != address(0));
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Transfer(address(0), _to, _amount);
  }
}
