module.exports = function (_name, _symbol, _decimals) {
  it('has a name', async function () {
    const name = await this.token.name();
    assert.equal(name, _name);
  });

  it('has a symbol', async function () {
    const symbol = await this.token.symbol();
    assert.equal(symbol, _symbol);
  });

  it('has an amount of decimals', async function () {
    const decimals = await this.token.decimals();
    assert(decimals.eq(_decimals));
  });
}
