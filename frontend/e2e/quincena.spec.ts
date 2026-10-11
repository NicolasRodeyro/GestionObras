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

test.describe('Quincena (E2E)', () => {
  test('calcula el sueldo de un empleado a partir de sus horas y permite marcarlo como pagado', async ({ page }) => {
    const nombreEmpleado = `Empleado Quincena E2E ${Date.now()}`;
    const nombreObra = `Obra Quincena E2E ${Date.now()}`;

    await login(page);

    // Obra para registrar horas
    await page.getByRole('link', { name: /^obras$/i }).click();
    await page.getByRole('button', { name: /nueva obra/i }).click();
    await page.getByLabel(/nombre/i).fill(nombreObra);
    await page.getByLabel(/presupuesto/i).fill('10000');
    await page.getByRole('button', { name: /guardar/i }).click();
    await expect(page.locator('tr', { hasText: nombreObra })).toBeVisible();

    // Empleado a $250/hora
    await page.goto('/empleados');
    await page.getByRole('button', { name: /nuevo empleado/i }).click();
    const empleadoForm = page.locator('form');
    await empleadoForm.getByLabel(/nombre/i).fill(nombreEmpleado);
    await empleadoForm.getByLabel(/tarifa/i).fill('250');
    await empleadoForm.getByRole('button', { name: /guardar/i }).click();
    const empleadoRow = page.locator('tr', { hasText: nombreEmpleado });
    await expect(empleadoRow).toBeVisible();

    // Registrar 160 horas para el período actual
    await empleadoRow.getByRole('link', { name: nombreEmpleado }).click();
    const now = new Date();
    await page.getByLabel(/^mes$/i).selectOption(String(now.getMonth() + 1));
    await page.getByLabel(/^año$/i).fill(String(now.getFullYear()));

    for (const horas of [100, 60]) {
      await page.getByRole('button', { name: /registrar horas/i }).click();
      const horasForm = page.locator('form');
      await horasForm.getByLabel(/^obra$/i).selectOption({ label: nombreObra });
      await horasForm.getByLabel(/fecha/i).fill(now.toISOString().slice(0, 10));
      await horasForm.getByLabel(/horas/i).fill(String(horas));
      await horasForm.getByRole('button', { name: /guardar/i }).click();
      await expect(page.getByRole('button', { name: /registrar horas/i })).toBeVisible();
    }

    // Ir a Quincena y calcular
    await page.goto('/quincena');
    await page.getByLabel(/empleado/i).selectOption({ label: nombreEmpleado });
    await page.getByLabel(/^mes$/i).selectOption(String(now.getMonth() + 1));
    await page.getByLabel(/^año$/i).fill(String(now.getFullYear()));

    await expect(page.getByText('160', { exact: true })).toBeVisible();
    await expect(page.getByText(/\$\s*40\.?000/).first()).toBeVisible();
    await expect(page.getByText(/^estado: calculada$/i)).toBeVisible();

    // Marcar como pagado
    await page.getByRole('button', { name: /marcar como pagad/i }).click();
    await expect(page.getByText(/^estado: pagada$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /marcar como pagad/i })).toHaveCount(0);
  });
});
