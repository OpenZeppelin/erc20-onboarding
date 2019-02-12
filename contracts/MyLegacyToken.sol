pragma solidity ^0.5.0;


import "./lib/ERC20Standard.sol";

contract MyLegacyToken is ERC20Standard {
  uint8 private constant DECIMALS = 18;
  string private constant NAME = "My Legacy Token";
  string private constant SYMBOL = "MLT";

  constructor () ERC20Standard(NAME, SYMBOL, DECIMALS) public {
    uint256 initialSupply = 10000 * (10 ** uint256(DECIMALS));
    _mint(msg.sender, initialSupply);
  }
}
