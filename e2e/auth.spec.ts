import { test, expect } from '@playwright/test';

// Use a unique email for each test run to avoid conflicts
const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

test.describe('Authentication Flow', () => {
  test('should allow user to signup, confirm email (manually), and login', async ({ page }) => {
    // --- Signup --- //
    await page.goto('/signup');

    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /新規登録/i })).toBeVisible();

    // Fill out the signup form
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
    await page.getByLabel('パスワード', { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel('パスワード (確認用)').fill(TEST_PASSWORD);

    // Click the signup button
    await page.getByRole('button', { name: /登録する/i }).click();

    // Expect an alert message about email confirmation
    // Note: Playwright needs to handle dialogs explicitly
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toContain('確認メールを送信しました');
      await dialog.accept();
    });

    // At this point, the user needs to manually confirm the email
    // via MailHog or their actual inbox if testing against a real Supabase instance.
    console.log(`--- ACTION REQUIRED --- 
Please confirm the email for ${TEST_EMAIL} before proceeding.`);
    // Add a pause for manual confirmation - adjust time as needed or use a prompt
    await page.waitForTimeout(15000); // Pause for 15 seconds
    console.log(`Proceeding with login attempt for ${TEST_EMAIL}...`);

    // --- Login after confirmation --- //
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /ログイン/i })).toBeVisible();

    // Fill out the login form
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
    await page.getByLabel('パスワード').fill(TEST_PASSWORD);

    // Click the login button
    await page.getByRole('button', { name: /ログイン/i }).click();

    // Expect redirection to the /books page after successful login
    await expect(page).toHaveURL('/books');
    // Add an assertion for an element expected on the /books page
    // await expect(page.getByRole('heading', { name: /家計簿選択/i })).toBeVisible() // Example

    console.log(`Login successful for ${TEST_EMAIL}`);
  });

  test('should show error message for incorrect login credentials', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL('/login');

    // Fill with incorrect password
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL); // Use the email from the previous test or a known one
    await page.getByLabel('パスワード').fill('wrongpassword');

    // Click login
    await page.getByRole('button', { name: /ログイン/i }).click();

    // Expect an error message (alert in this case)
    page.once('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      expect(dialog.message()).toContain('Invalid login credentials'); // Check for Supabase error
      await dialog.accept();
    });

    // Wait for the dialog to appear and be handled
    await page.waitForEvent('dialog');

    // Ensure still on login page
    await expect(page).toHaveURL('/login');
  });
});
