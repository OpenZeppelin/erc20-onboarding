const { Contracts, encodeCall, assertRevert } = require('zos-lib')
const shouldBehaveLikeERC20 = require('./behaviors/ERC20.behavior')
const shouldBehaveLikeERC20Detailed = require('./behaviors/ERC20Detailed.behavior')

const MyLegacyToken = Contracts.getFromLocal('MyLegacyToken')
const MyUpgradeableToken = Contracts.getFromLocal('MyUpgradeableToken')
const ERC20Migrator = Contracts.getFromNodeModules('openzeppelin-eth', 'ERC20Migrator')

contract('MyUpgradeableToken', function ([_, owner, recipient, anotherAccount]) {
  const name = 'My Legacy Token'
  const symbol = 'MLT'
  const decimals = 18

  beforeEach('deploying legacy and upgradeable tokens', async function () {
    this.legacyToken = await MyLegacyToken.new({ from: owner })
    
    this.migrator = await ERC20Migrator.new()
    const migratorData = encodeCall('initialize', ['address'], [this.legacyToken.address])
    await this.migrator.sendTransaction({ data: migratorData })
    
    this.upgradeableToken = await MyUpgradeableToken.new()
    const upgradeableTokenData = encodeCall('initialize', ['address', 'address'], [this.legacyToken.address, this.migrator.address])
    await this.upgradeableToken.sendTransaction({ data: upgradeableTokenData })
  })

  describe('ERC20 token behavior', function () {
    const initialSupply = new web3.BigNumber('10000e18')

    beforeEach('migrating balance to new token', async function () {
      await this.legacyToken.approve(this.migrator.address, initialSupply, { from: owner })
      await this.migrator.migrate(owner, initialSupply)
      this.token = this.upgradeableToken
    })

    shouldBehaveLikeERC20([owner, recipient, anotherAccount], initialSupply)
    shouldBehaveLikeERC20Detailed(name, symbol, decimals)
  })

  describe('migrate', function () {
    beforeEach('approving 50 tokens to the new contract', async function () {
      await this.legacyToken.approve(this.migrator.address, 50, { from: owner })
    })

    describe('when the amount is lower or equal to the one approved', function () {
      const amount = 50

      it('mints that amount of the new token', async function () {
        await this.migrator.migrate(owner, amount)

        const currentBalance = await this.upgradeableToken.balanceOf(owner)
        assert(currentBalance.eq(amount))
      })

      it('transfers given amount of old tokens to the migrator', async function () {
        await this.migrator.migrate(owner, amount)

        const currentMigratorBalance = await this.legacyToken.balanceOf(this.migrator.address)
        assert(currentMigratorBalance.eq(amount))
      })

      it('updates the total supply', async function () {
        await this.migrator.migrate(owner, amount)

        const currentSupply = await this.upgradeableToken.totalSupply()
        assert(currentSupply.eq(amount))
      })
    })

    describe('when the given amount is higher than the one approved', function () {
      const amount = 51

      it('reverts', async function () {
        await assertRevert(this.migrator.migrate(owner, amount))
      })
    })
  })
})
