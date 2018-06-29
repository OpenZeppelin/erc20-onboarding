# ERC20 opt in on-boarding

This is sample project illustrating a possible solution of how a legacy ERC20 token could be migrated to an 
upgradeable version through ZeppelinOS. This proposal is based on the [opt in on-boarding strategy](https://github.com/zeppelinos/labs/tree/master/migrating_legacy_token_opt_in)
we've been exploring. This is a basic implementation of this strategy.  
 
## Strategy

This strategy is based on an optional migration of the token balances. This migration is performed and paid by the 
token holders. The new token contract starts with no initial supply and no balances. The only way to "mint" the new 
tokens is for users to "turn in" their old ones. This is done by first approving the amount they want to migrate via 
`ERC20.approve(newTokenAddress, amountToMigrate)` and then calling a function of the new token called `migrateToken`. 
The old tokens are sent to a burn address, and the holder receives an equal amount in the new contract.


This is one of the two strategies explored by the ZeppelinOS dev team. To read more about them please visit our [labs 
repository](https://github.com/zeppelinos/labs)

## Assumptions

This on-boarding plan considers the following assumptions:
- There is an already deployed token contract that follows the ERC20 standard.
- The token contract is not frozen or paused, meaning token holders can trade this token.

## On-boarding plan

The idea of this proposal is to use the command line tool of ZeppelinOS to deploy a new upgradeable version of your 
token contract. To do so, we are using a migration contract provided by the OZ standard library for ZeppelinOS.  

We will deploy a sample old ERC20 token manually, and then we are going to start a ZeppelinOS project linked to the 
OpenZeppelin stdlib in order to deploy our new upgradeable token.   

**Caveat**

*The migration contract is not yet released in OpenZeppelin but will be soon. In the meantime, this repository includes 
such implementation to make things easier for the demonstration. You will see an `OptInERC20Migration` contract inside 
the contracts folder.*

## On-boarding plan demonstration

### 1. Deploy your old ERC20 token contract

In this repository you will find just one contract called `MyOldToken` which intends to be the old regular ERC20 
token implementation. As you can see, we are using the `StandardToken` contract provided by OpenZeppelin. 

Before we begin, remember to install the dependencies running `npm install`. Additionally, you could check everything is 
working as expected by running the test files with `npm test`. Now, let's deploy the old token, we will use a truffle 
develop console. You can start it by running `npx truffle develop`. Then, please run the following commands:

```sh
truffle(develop)> compile
truffle(develop)> owner = web3.eth.accounts[1]
truffle(develop)> MyOldToken.new('MyToken', 'MTK', 18, 100, { from: owner }).then(i => legacyToken = i)
truffle(develop)> legacyToken.address
'0x...'
```

Please keep track of the `owner` and `legacyToken` addresses, we will need in the following steps.

You can ensure the old token balance by running:
```sh
truffle(develop)> legacyToken.balanceOf(owner)
BigNumber { s: 1, e: 0, c: [ 100 ] }
```

Remember not to close this session, we will need it later.

### 2. Initialize your ZeppelinOS project

To initialize a ZeppelinOS project, open a terminal and run the following lines:

```sh
zos init erc20-opt-in-on-boarding 1.0.0
zos link openzeppelin-zos@1.9.1
zos add OptInERC20Migration
```

We just initialized a new ZeppelinOS project linked to the OpenZeppelin stdlib and added the migration contract.
You should see a new `zos.json` file with the following content:

```json
{
  "name": "erc20-opt-in-on-boarding",
  "version": "1.0.0",
  "contracts": {
    "OptInERC20Migration": "OptInERC20Migration"
  },
  "stdlib": {
    "name": "openzeppelin-zos",
    "version": "1.9.1"
  }
}
``` 

### 3. Deploy the new upgradeable ERC20

The first thing we have to do is to deploy our contracts' source code. We will also need to deploy the OpenZeppelin 
stdlib since we will be working on a local environment. To do so please run the following command:
```sh
zos push -n local --deploy-stdlib
```

After running said command you should see a new `zos.local.json` with the following content:
```json
{
  "contracts": {
    "OptInERC20Migration": {
      "address": "0x...",
      "bytecodeHash": "[bytecode hash]"
    }
  },
  "proxies": {},
  "stdlib": {
    "address": "0x...",
    "customDeploy": true,
    "name": "openzeppelin-zos",
    "version": "1.9.1"
  },
  "app": {
    "address": "0x..."
  },
  "version": "1.0.0",
  "package": {
    "address": "0x..."
  },
  "provider": {
    "address": "0x.."
  }
}
```

Now, let's deploy our new upgradeable ERC20 token, please run the following line (you will need the legacy token address): 
```sh
zos create OptInERC20Migration --args [LEGACY_TOKEN_ADDRESS] -n local
```

Save the new token address outputted by this command, we will need it later.

Please note that the `proxies` part of the `zos.local.json` should have been modified with the following data:
```json
{
  ...,
  "proxies": {
    "OptInERC20Migration": [
      {
        "address": "0x...",
        "version": "1.0.0",
        "implementation": "0x..."
      }
    ]
  },
  ...
}
```

### 4. Migrate your old ERC20 token balance 

Please go back to the truffle develop console and run the following commands to migrate your balance:  

```sh
truffle(develop)> token = OptInERC20Migration.at('[UPGRADEABLE_TOKEN_ADDRESS]')
truffle(develop)> legacyToken.balanceOf(owner).then(b => balance = b)
truffle(develop)> legacyToken.approve(token.address, balance, { from: owner })
truffle(develop)> token.migrate({ from: owner })
```

You can now check old token balance:
```sh
truffle(develop)> legacyToken.balanceOf(owner)
BigNumber { s: 1, e: 0, c: [ 0 ] }
```

Also the burned balance:

```sh
truffle(develop)> legacyToken.balanceOf('0x000000000000000000000000000000000000dead')
BigNumber { s: 1, e: 0, c: [ 100 ] }
```

And the new token balance:

```sh
truffle(develop)> token.balanceOf(owner)
BigNumber { s: 1, e: 0, c: [ 100 ] }
```


## Pros & Cons

Pros:
- Exchange of the legacy token can continue as before, so exchanges don't have to scramble to support the new token version
- Users (probably speculators) who don't need/aren't interested in the new functionality don't have to upgrade
- If the demand for the upgraded token becomes higher than the legacy token, the market will incentivize speculators to upgrade and exchanges to support the new token/drop support for the old one. Onboarding becomes a more gradual and organic process

Cons:
- The token's supply is split amongst two contracts.
- Requires token users pay for migration gas costs.
- Assumes the old token contract is not buggy.
