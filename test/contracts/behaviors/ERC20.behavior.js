const { assertRevert } = require('zos-lib')

module.exports = function ([owner, recipient, anotherAccount], initialSupply) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      const totalSupply = await this.token.totalSupply()

      assert(totalSupply.eq(initialSupply))
    })
  })

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(anotherAccount)

        assert(balance.eq(0))
      })
    })

    describe('when the requested account has some tokens', function () {
      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner)

        assert(balance.eq(initialSupply))
      })
    })
  })

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.add(1)

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }))
        })
      })

      describe('when the sender has enough balance', function () {
        const amount = initialSupply

        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner })

          const senderBalance = await this.token.balanceOf(owner)
          assert(senderBalance.eq(0))

          const recipientBalance = await this.token.balanceOf(to)
          assert(recipientBalance.eq(amount))
        })

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Transfer')
          assert.equal(logs[0].args.from, owner)
          assert.equal(logs[0].args.to, to)
          assert(logs[0].args.value.eq(amount))
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, initialSupply, { from: owner }))
      })
    })
  })

  describe('approve', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        const amount = initialSupply

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.add(1)

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const amount = initialSupply
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await assertRevert(this.token.approve(spender, amount, { from: owner }))
      })
    })
  })

  describe('transfer from', function () {
    const spender = recipient

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, initialSupply, { from: owner })
        })

        describe('when the owner has enough balance', function () {
          const amount = initialSupply

          it('transfers the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender })

            const senderBalance = await this.token.balanceOf(owner)
            assert(senderBalance.eq(0))

            const recipientBalance = await this.token.balanceOf(to)
            assert(recipientBalance.eq(amount))
          })

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(0))
          })

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'Transfer')
            assert.equal(logs[0].args.from, owner)
            assert.equal(logs[0].args.to, to)
            assert(logs[0].args.value.eq(amount))
          })
        })

        describe('when the owner does not have enough balance', function () {
          const amount = initialSupply.add(1)

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })
      })

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, initialSupply.minus(1), { from: owner })
        })

        describe('when the owner has enough balance', function () {
          const amount = initialSupply

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })

        describe('when the owner does not have enough balance', function () {
          const amount = initialSupply.add(1)

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const amount = initialSupply
      const to = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.approve(spender, amount, { from: owner })
      })

      it('reverts', async function () {
        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
      })
    })
  })

  describe('decrease approval', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        const amount = initialSupply

        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await assertRevert(this.token.decreaseAllowance(spender, amount, { from: owner }))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount.add(1), { from: owner })
          })

          it('emits an approval event', async function () {
            const { logs } = await this.token.decreaseAllowance(spender, amount, { from: owner })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'Approval')
            assert.equal(logs[0].args.owner, owner)
            assert.equal(logs[0].args.spender, spender)
            assert(logs[0].args.value.eq(1))
          })

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(1))
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.add(1)

        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await assertRevert(this.token.decreaseAllowance(spender, amount, { from: owner }))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount.add(1), { from: owner })
          })

          it('emits an approval event', async function () {
            const { logs } = await this.token.decreaseAllowance(spender, amount, { from: owner })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'Approval')
            assert.equal(logs[0].args.owner, owner)
            assert.equal(logs[0].args.spender, spender)
            assert(logs[0].args.value.eq(1))
          })

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(1))
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const amount = initialSupply
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await assertRevert(this.token.decreaseAllowance(spender, amount, { from: owner }))
      })
    })
  })

  describe('increase approval', function () {
    const amount = initialSupply

    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount.add(1)))
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        const amount = initialSupply.add(1)

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(amount.add(1)))
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await assertRevert(this.token.increaseAllowance(spender, amount, { from: owner }))
      })
    })
  })
}
