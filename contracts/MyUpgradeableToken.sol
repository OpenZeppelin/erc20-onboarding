pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-eth/contracts/drafts/ERC20Migrator.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";

/**
 * @title MyUpgradeableToken
 * @dev This contract is an upgradeable ERC20 token example to show how a regular token could be migrated using
 * ZeppelinOS and the ERC20Migrator contract provided by the EVM package openzeppelin-eth.
 */
contract MyUpgradeableToken is Initializable, ERC20, ERC20Detailed, ERC20Mintable {

  /**
   * @dev Initialization function.
   * @dev This function will initialize the new upgradeable ERC20 contract and will set up the ERC20 migrator.
   */
  function initialize(ERC20Detailed _legacyToken, ERC20Migrator _migrator) initializer public {
    ERC20Mintable.initialize(_migrator);
    ERC20Detailed.initialize(_legacyToken.name(), _legacyToken.symbol(), _legacyToken.decimals());
    _migrator.beginMigration(this);
  }

}
