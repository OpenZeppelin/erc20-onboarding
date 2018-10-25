const { Contracts } = require('zos-lib')
const shouldBehaveLikeERC20Detailed = require('./behaviors/ERC20Detailed.behavior')
const shouldBehaveLikeERC20 = require('./behaviors/ERC20.behavior')

const MyLegacyToken = Contracts.getFromLocal('MyLegacyToken')

contract('MyLegacyToken', function ([_, owner, recipient, anotherAccount]) {
  const initialSupply = new web3.BigNumber('10000e18')

  beforeEach('deploying token', async function () {
    this.token = await MyLegacyToken.new({ from: owner })
  })

  shouldBehaveLikeERC20([owner, recipient, anotherAccount], initialSupply)
  shouldBehaveLikeERC20Detailed('My Legacy Token', 'MLT', 18, initialSupply)
})
