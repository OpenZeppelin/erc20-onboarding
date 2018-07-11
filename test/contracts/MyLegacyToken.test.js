const { Contracts } = require('zos-lib')
const shouldBehaveLikeDetailedERC20 = require('./behaviors/DetailedERC20.behavior')
const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.behavior')

const MyLegacyToken = Contracts.getFromLocal('MyLegacyToken')

contract('MyLegacyToken', function ([_, owner, recipient, anotherAccount]) {
  const name = 'MyToken'
  const symbol = 'MTK'
  const decimals = 18

  beforeEach('deploying token', async function () {
    this.token = await MyLegacyToken.new(name, symbol, decimals, { from: owner })
  })

  shouldBehaveLikeDetailedERC20(name, symbol, decimals)
  shouldBehaveLikeStandardToken([owner, recipient, anotherAccount])
})
