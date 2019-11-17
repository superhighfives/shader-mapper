import { newE2EPage } from '@stencil/core/testing';

describe('shader-mapper', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<shader-mapper></shader-mapper>');

    const element = await page.find('shader-mapper');
    expect(element).toHaveClass('hydrated');
  });
});
