import { expect, test } from '@playwright/test';

const SEEDED_EMAIL = 'admin@obra.com';
const SEEDED_PASSWORD = 'admin12345';

test.describe('Autenticación (E2E)', () => {
  test('redirige a /login cuando no hay sesión', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(SEEDED_EMAIL);
    await page.getByLabel(/contraseña/i).fill('password-incorrecta');
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page.getByRole('alert').last()).toContainText(/credenciales inválidas/i);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login exitoso, persistencia de sesión y logout', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(SEEDED_EMAIL);
    await page.getByLabel(/contraseña/i).fill(SEEDED_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText(/administrador/i)).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).state.token).toBeTruthy();

    await page.reload();
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText(/administrador/i)).toBeVisible();

    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    const storedAfterLogout = await page.evaluate(() => localStorage.getItem('auth-storage'));
    expect(JSON.parse(storedAfterLogout!).state.token).toBeNull();
  });
});
