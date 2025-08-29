import { test, expect } from '@playwright/test';

test('should navigate to the home page and display the title', async ({ page }) => {
  // Start from the index page (the baseURL is set in the config)
  await page.goto('/');

  // The page should contain an image with the alt text "Next.js logo"
  await expect(page.getByAltText('Next.js logo')).toBeVisible();
});
