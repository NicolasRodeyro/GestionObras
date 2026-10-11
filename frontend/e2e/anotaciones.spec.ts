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

test.describe('Anotaciones (E2E)', () => {
  test('agrega una anotación a una obra, la marca como completada y la elimina', async ({ page }) => {
    const nombreObra = `Obra Anotaciones E2E ${Date.now()}`;
    const tituloAnotacion = `Revisar plano E2E ${Date.now()}`;

    await login(page);

    // Crear una obra y entrar a su detalle
    await page.getByRole('link', { name: /^obras$/i }).click();
    await page.getByRole('button', { name: /nueva obra/i }).click();
    await page.getByLabel(/nombre/i).fill(nombreObra);
    await page.getByLabel(/presupuesto/i).fill('5000');
    await page.getByRole('button', { name: /guardar/i }).click();

    const obraRow = page.locator('tr', { hasText: nombreObra });
    await expect(obraRow).toBeVisible();
    await obraRow.getByRole('link', { name: nombreObra }).click();
    await expect(page.getByRole('heading', { name: nombreObra })).toBeVisible();

    // Agregar una anotación
    await page.getByRole('button', { name: /agregar anotación/i }).click();
    const anotacionForm = page.locator('form');
    await anotacionForm.getByLabel(/título/i).fill(tituloAnotacion);
    await anotacionForm.getByLabel(/prioridad/i).selectOption('alta');
    await anotacionForm.getByRole('button', { name: /guardar/i }).click();

    const item = page.locator('li', { hasText: tituloAnotacion });
    await expect(item).toBeVisible();
    await expect(item).toContainText('alta');

    // Marcar como completada
    const checkbox = item.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Eliminar
    await item.getByRole('button', { name: /eliminar/i }).click();
    await expect(page.locator('li', { hasText: tituloAnotacion })).toHaveCount(0);
  });
});
