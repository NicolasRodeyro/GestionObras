import { expect, test } from '@playwright/test';

const SEEDED_EMAIL = 'admin@obra.com';
const SEEDED_PASSWORD = 'admin12345';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(SEEDED_EMAIL);
  await page.getByLabel(/contraseña/i).fill(SEEDED_PASSWORD);
  await page.getByRole('button', { name: /ingresar/i }).click();
  await expect(page).toHaveURL('http://localhost:5173/');
}

test.describe('Obras CRUD (E2E)', () => {
  test('crea, edita, ve el detalle y elimina una obra', async ({ page }) => {
    const nombreObra = `Obra E2E ${Date.now()}`;
    const nombreEditado = `${nombreObra} (editada)`;

    await login(page);
    await page.getByRole('link', { name: /obras/i }).click();
    await expect(page).toHaveURL('http://localhost:5173/obras');

    // Crear
    await page.getByRole('button', { name: /nueva obra/i }).click();
    await page.getByLabel(/nombre/i).fill(nombreObra);
    await page.getByLabel(/presupuesto/i).fill('123456');
    await page.getByRole('button', { name: /guardar/i }).click();

    const row = page.locator('tr', { hasText: nombreObra });
    await expect(row).toBeVisible();

    // Ver detalle
    await row.getByRole('link', { name: nombreObra }).click();
    await expect(page).toHaveURL(/\/obras\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: nombreObra })).toBeVisible();
    await expect(page.getByText('planificada')).toBeVisible();

    await page.getByRole('link', { name: /volver a obras/i }).click();
    await expect(page).toHaveURL('http://localhost:5173/obras');

    // Editar
    const rowAfterCreate = page.locator('tr', { hasText: nombreObra });
    await rowAfterCreate.getByRole('button', { name: /editar/i }).click();
    const nombreInput = page.getByLabel(/nombre/i);
    await nombreInput.fill('');
    await nombreInput.fill(nombreEditado);
    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(page.locator('tr', { hasText: nombreEditado })).toBeVisible();

    // Eliminar
    const rowAfterEdit = page.locator('tr', { hasText: nombreEditado });
    await rowAfterEdit.getByRole('button', { name: /eliminar/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    await expect(page.locator('tr', { hasText: nombreEditado })).toHaveCount(0);
  });
});
