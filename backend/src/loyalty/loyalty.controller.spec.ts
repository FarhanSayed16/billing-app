describe('LoyaltyController JWT brandId usage', () => {
  it('documents that controller must pass brandId not brand_id', () => {
    // Compile-time regression guard: loyalty.controller.ts uses req.user.brandId
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const src = require('fs').readFileSync(
      require('path').join(__dirname, 'loyalty.controller.ts'),
      'utf8',
    );
    expect(src).toContain('req.user.brandId');
    expect(src).not.toMatch(/req\.user\.brand_id/);
  });
});
