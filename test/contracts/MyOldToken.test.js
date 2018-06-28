const { Contracts } = require('zos-lib')
const shouldBehaveLikeDetailedERC20 = require('./behaviors/DetailedERC20.behavior')
const shouldBehaveLikeStandardToken = require('./behaviors/StandardToken.behavior')

const MyOldToken = Contracts.getFromLocal('MyOldToken')

contract('MyOldToken', function ([_, owner, recipient, anotherAccount]) {
  const name = 'MyToken'
  const symbol = 'MTK'
  const decimals = 18

  beforeEach('deploying token', async function () {
    this.token = await MyOldToken.new(name, symbol, decimals, 100, { from: owner })
  })

  shouldBehaveLikeDetailedERC20(name, symbol, decimals)
  shouldBehaveLikeStandardToken([owner, recipient, anotherAccount])
})
