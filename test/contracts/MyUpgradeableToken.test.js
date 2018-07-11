const { Contracts, encodeCall, assertRevert } = require('zos-lib')
const shouldBehaveLikeDetailedERC20 = require('./behaviors/DetailedERC20.behavior')
const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.behavior')

const MyLegacyToken = Contracts.getFromLocal('MyLegacyToken')
const MyUpgradeableToken = Contracts.getFromLocal('MyUpgradeableToken')

contract('MyUpgradeableToken', function ([_, owner, recipient, anotherAccount]) {
  const BURN_ADDRESS = '0x000000000000000000000000000000000000dead'
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach('deploying tokens', async function () {
    this.legacyToken = await MyLegacyToken.new('MyToken', 'MTK', 18, { from: owner })
    this.upgradeableToken = await MyUpgradeableToken.new()
    const data = encodeCall('initialize', ['address', 'string', 'string', 'uint8'], [this.legacyToken.address, 'MyToken', 'MTK', 18])

    await this.upgradeableToken.sendTransaction({ data })
  })

  describe('migrate', function () {
    describe('when the approved balance is higher or equal to the owned balance', function () {
      beforeEach('approving the whole balance to the new contract', async function () {
        this.balanceToBeMigrated = await this.legacyToken.balanceOf(owner)
        await this.legacyToken.approve(this.upgradeableToken.address, this.balanceToBeMigrated, { from: owner })
      })

      it('mints the same balance of the new token', async function () {
        const receipt = await this.upgradeableToken.migrate({ from: owner })

        const currentBalance = await this.upgradeableToken.balanceOf(owner)
        assert(currentBalance.eq(this.balanceToBeMigrated))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[0]
        assert.equal(event.args.from, ZERO_ADDRESS)
        assert.equal(event.args.to, owner)
        assert(event.args.value.eq(this.balanceToBeMigrated))
      })

      it('burns a given amount of old tokens', async function () {
        const receipt = await this.upgradeableToken.migrate({ from: owner })

        const currentBurnedBalance = await this.legacyToken.balanceOf(BURN_ADDRESS)
        assert(currentBurnedBalance.eq(this.balanceToBeMigrated))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[1]
        assert.equal(event.args.from, owner)
        assert.equal(event.args.to, BURN_ADDRESS)
        assert(event.args.value.eq(this.balanceToBeMigrated))
      })

      it('updates the total supply', async function () {
        await this.upgradeableToken.migrate({ from: owner })

        const currentSupply = await this.upgradeableToken.totalSupply()
        assert(currentSupply.eq(this.balanceToBeMigrated))
      })
    })

    describe('when the approved balance is lower than the owned balance', function () {
      beforeEach('approving part of the balance to the new contract', async function () {
        await this.legacyToken.approve(this.upgradeableToken.address, 10, { from: owner })
      })

      it('reverts', async function () {
        await assertRevert(this.upgradeableToken.migrate({ from: owner }))
      })
    })
  })

  describe('migrateToken', function () {
    beforeEach('approving 50 tokens to the new contract', async function () {
      await this.legacyToken.approve(this.upgradeableToken.address, 50, { from: owner })
    })

    describe('when the amount is lower or equal to the one approved', function () {
      const amount = 50

      it('mints that amount of the new token', async function () {
        const receipt = await this.upgradeableToken.migrateToken(amount, { from: owner })

        const currentBalance = await this.upgradeableToken.balanceOf(owner)
        assert(currentBalance.eq(amount))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[0]
        assert.equal(event.args.from, ZERO_ADDRESS)
        assert.equal(event.args.to, owner)
        assert(event.args.value.eq(amount))
      })

      it('burns a given amount of old tokens', async function () {
        const receipt = await this.upgradeableToken.migrateToken(amount, { from: owner })

        const currentBurnedBalance = await this.legacyToken.balanceOf(BURN_ADDRESS)
        assert(currentBurnedBalance.eq(amount))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[1]
        assert.equal(event.args.from, owner)
        assert.equal(event.args.to, BURN_ADDRESS)
        assert(event.args.value.eq(amount))
      })

      it('updates the total supply', async function () {
        await this.upgradeableToken.migrateToken(amount, { from: owner })

        const currentSupply = await this.upgradeableToken.totalSupply()
        assert(currentSupply.eq(amount))
      })
    })

    describe('when the given amount is higher than the one approved', function () {
      const amount = 51

      it('reverts', async function () {
        await assertRevert(this.upgradeableToken.migrateToken(amount, { from: owner }))
      })
    })
  })

  describe('migrateTokenTo', function () {
    beforeEach('approving 50 tokens to the new contract', async function () {
      await this.legacyToken.approve(this.upgradeableToken.address, 50, { from: owner })
    })

    describe('when the amount is lower or equal to the one approved', function () {
      const amount = 50

      it('mints that amount of the new token to the requested recipient', async function () {
        const receipt = await this.upgradeableToken.migrateTokenTo(recipient, amount, { from: owner })

        const currentBalance = await this.upgradeableToken.balanceOf(recipient)
        assert(currentBalance.eq(amount))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[0]
        assert.equal(event.args.from, ZERO_ADDRESS)
        assert.equal(event.args.to, recipient)
        assert(event.args.value.eq(amount))
      })

      it('burns a given amount of old tokens', async function () {
        const receipt = await this.upgradeableToken.migrateToken(amount, { from: owner })

        const currentBurnedBalance = await this.legacyToken.balanceOf(BURN_ADDRESS)
        assert(currentBurnedBalance.eq(amount))

        assert.equal(receipt.logs.length, 2)
        const event = receipt.logs[1]
        assert.equal(event.args.from, owner)
        assert.equal(event.args.to, BURN_ADDRESS)
        assert(event.args.value.eq(amount))
      })

      it('updates the total supply', async function () {
        await this.upgradeableToken.migrateTokenTo(recipient, amount, { from: owner })

        const currentSupply = await this.upgradeableToken.totalSupply()
        assert(currentSupply.eq(amount))
      })
    })

    describe('when the given amount is higher than the one approved', function () {
      const amount = 51

      it('reverts', async function () {
        await assertRevert(this.upgradeableToken.migrateToken(amount, { from: owner }))
      })
    })
  })

  describe('standard token behavior', function () {
    beforeEach('migrating balance to new token', async function () {
      await this.legacyToken.approve(this.upgradeableToken.address, 100, { from: owner })
      await this.upgradeableToken.migrateToken(100, { from: owner })
      this.token = this.upgradeableToken
    })

    shouldBehaveLikeDetailedERC20('MyToken', 'MTK', 18)
    shouldBehaveLikeStandardToken([owner, recipient, anotherAccount])
  })
})
