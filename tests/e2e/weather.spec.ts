import { expect, test } from '@playwright/test';

const geocodingResponse = {
  results: [
    {
      id: 1,
      name: 'São Paulo',
      admin1: 'São Paulo',
      country: 'Brasil',
      country_code: 'BR',
      latitude: -23.55,
      longitude: -46.64,
      timezone: 'America/Sao_Paulo',
    },
  ],
};

const weatherResponse = {
  current: {
    time: '2026-10-28T12:00',
    temperature_2m: 0,
    apparent_temperature: -1,
    relative_humidity_2m: 55,
    wind_speed_10m: 12,
    precipitation: 0,
    pressure_msl: 1017,
    weather_code: 0,
    is_day: 1,
  },
  daily: {
    time: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_max: [18, 17, 16, 15, 20],
    temperature_2m_min: [10, 9, 8, 7, 12],
    precipitation_probability_max: [10, 20, 25, 30, 15],
    precipitation_sum: [0, 1.2, 2.5, 0.8, 0.2],
  },
};

test.describe('weather app e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(geocodingResponse),
      });
    });

    await page.route('**/api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(weatherResponse),
      });
    });
  });

  test('searches a city, sees the forecast and converts the temperature', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.getByRole('button', { name: /São Paulo/ }).click();

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    await expect(page.getByText('Previsão de 5 dias')).toBeVisible();

    await page.getByRole('button', { name: 'Selecionar °F' }).click();

    await expect(page.getByText('32°F')).toBeVisible();
  });

  test('shows an empty state when geocoding has no results', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('Cidade inexistente');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  });

  test('excludes approximate city names and keeps the exact Salvador match', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 1,
              name: 'Salvador',
              admin1: 'Bahia',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -12.97,
              longitude: -38.5,
              timezone: 'America/Bahia',
            },
            {
              id: 2,
              name: 'Salvador do Maranhão',
              admin1: 'Maranhão',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -4.1,
              longitude: -44.0,
              timezone: 'America/Fortaleza',
            },
            {
              id: 3,
              name: 'São Salvador',
              admin1: 'Maranhão',
              country: 'Brasil',
              country_code: 'BR',
              latitude: -4.2,
              longitude: -44.1,
              timezone: 'America/Fortaleza',
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('Salvador');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByText('Selecione a cidade')).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvador.*Bahia/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvador do Maranhão/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /São Salvador/ })).toHaveCount(0);
    await expect(page.getByText('Previsão de 5 dias')).toHaveCount(0);

    await page.getByRole('button', { name: /Salvador.*Bahia/ }).click();

    await expect(page.getByRole('heading', { name: 'Salvador' })).toBeVisible();
  });

  test('keeps the main flow working on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.getByRole('button', { name: /São Paulo/ }).click();

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    await expect(page.getByText('Previsão de 5 dias')).toBeVisible();
  });
});
