pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract MyLegacyToken is ERC20, ERC20Detailed {
  uint8 private constant DECIMALS = 18;
  string private constant NAME = "My Legacy Token";
  string private constant SYMBOL = "MLT";

  constructor () ERC20Detailed(NAME, SYMBOL, DECIMALS) public {
    uint256 initialSupply = 10000 * (10 ** uint256(DECIMALS));
    _mint(msg.sender, initialSupply);
  }
}
