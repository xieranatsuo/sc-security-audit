/**
 * E2E tests — Playwright.
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test';

test.describe('Smart Contract Audit Platform', () => {
  test('home page redirects to /audit', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/audit');
  });

  test('audit page loads correctly', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.locator('h1')).toContainText('Audit Smart Contract');
  });

  test('audit form shows validation error for empty address', async ({ page }) => {
    await page.goto('/audit');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-500\\/10')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/audit');

    // Click on Market Data
    await page.click('a[href="/market"]');
    await expect(page).toHaveURL('/market');
    await expect(page.locator('h1')).toContainText('Market Data');

    // Click on Risk Dashboard
    await page.click('a[href="/risk"]');
    await expect(page).toHaveURL('/risk');
    await expect(page.locator('h1')).toContainText('Risk Dashboard');
  });

  test('health endpoint returns healthy', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.status).toBe('healthy');
    expect(data.status).toBe('live');
    expect(data.provider).toBe('internal');
    expect(data.lastUpdated).toBeTruthy();
  });

  test('market data endpoint returns prices', async ({ request }) => {
    const response = await request.get('/api/market/data?symbols=ETH');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.prices).toBeDefined();
    expect(data.data.prices.length).toBeGreaterThan(0);
    expect(data.data.prices[0]).toHaveProperty('price');
  });

  test('audit endpoint validates input', async ({ request }) => {
    const response = await request.post('/api/audit/contract', {
      data: { address: 'invalid', chain: 'ethereum' },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.status).toBe('error');
    expect(data.error).toBeTruthy();
  });

  test('risk score endpoint validates formula', async ({ request }) => {
    const response = await request.post('/api/audit/risk-score', {
      data: {
        findings: [
          { severity: 0.9, exploitability: 0.8, attackComplexity: 0.3, impact: 0.85, detectionDifficulty: 0.4 },
        ],
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.formula).toBe('RiskScore = 100 * (w1*S + w2*E + w3*A + w4*I + w5*D)');
    expect(data.data.results[0].score).toBeGreaterThan(0);
  });

  test('explorer endpoint validates address', async ({ request }) => {
    const response = await request.get('/api/explorer/ethereum/invalid');
    expect(response.status()).toBe(400);
  });

  test('scanner status endpoint returns info', async ({ request }) => {
    const response = await request.get('/api/scanner/status');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.python.analyzers).toContain('Reentrancy');
    expect(data.data.go.maxConcurrency).toBe(10);
  });
});
