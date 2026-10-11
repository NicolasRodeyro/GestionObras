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

test.describe('Gastos CRUD (E2E)', () => {
  test('crea una obra propia, registra un gasto, lo filtra, edita y elimina', async ({ page }) => {
    const nombreObra = `Obra Gastos E2E ${Date.now()}`;
    const detalleGasto = `Compra E2E ${Date.now()}`;
    const detalleEditado = `${detalleGasto} (editado)`;

    await login(page);

    // Crear una obra propia para no depender de datos sembrados
    await page.getByRole('link', { name: /^obras$/i }).click();
    await page.getByRole('button', { name: /nueva obra/i }).click();
    await page.getByLabel(/nombre/i).fill(nombreObra);
    await page.getByLabel(/presupuesto/i).fill('10000');
    await page.getByRole('button', { name: /guardar/i }).click();
    await expect(page.locator('tr', { hasText: nombreObra })).toBeVisible();

    // Ir a Gastos y crear uno para esa obra
    await page.goto('/gastos');
    await expect(page).toHaveURL('http://localhost:5173/gastos');

    await page.getByRole('button', { name: /nuevo gasto/i }).click();
    const createForm = page.locator('form');
    await createForm.getByLabel(/^obra$/i).selectOption({ label: nombreObra });
    await createForm.getByLabel(/categoría/i).selectOption('materiales');
    await createForm.getByLabel(/monto/i).fill('4321');
    await createForm.getByLabel(/fecha/i).fill('2026-06-15');
    await createForm.getByLabel(/detalle/i).fill(detalleGasto);
    await createForm.getByRole('button', { name: /guardar/i }).click();

    const row = page.locator('tr', { hasText: detalleGasto });
    await expect(row).toBeVisible();
    await expect(row).toContainText(nombreObra);

    // Filtrar por esa obra y confirmar que sigue apareciendo
    await page.getByLabel(/filtrar por obra/i).selectOption({ label: nombreObra });
    await expect(page.locator('tr', { hasText: detalleGasto })).toBeVisible();

    // Editar
    const rowToEdit = page.locator('tr', { hasText: detalleGasto });
    await rowToEdit.getByRole('button', { name: /editar/i }).click();
    const detalleInput = page.getByLabel(/detalle/i);
    await detalleInput.fill('');
    await detalleInput.fill(detalleEditado);
    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(page.locator('tr', { hasText: detalleEditado })).toBeVisible();

    // Eliminar
    const rowToDelete = page.locator('tr', { hasText: detalleEditado });
    await rowToDelete.getByRole('button', { name: /eliminar/i }).click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    await expect(page.locator('tr', { hasText: detalleEditado })).toHaveCount(0);
  });
});
