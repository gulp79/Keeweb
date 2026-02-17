import { test, expect } from '@playwright/test'

async function openFreshDb(page: Parameters<typeof test>[1]) {
  await page.goto('/unlock')
  await page.getByText('New Database').click()
  await page.getByLabel('Database Name').fill('E2E Test')
  await page.getByLabel('Master Password').fill('E2EPassword999!')
  await page.getByRole('button', { name: /Create Database/i }).click()
  await expect(page).toHaveURL(/\/db\//)
}

test.describe('Entry management', () => {
  test('search box is accessible', async ({ page }) => {
    await openFreshDb(page)
    await expect(page.getByPlaceholder(/Search entries/i)).toBeVisible()
  })

  test('Ctrl+F focuses search box', async ({ page }) => {
    await openFreshDb(page)
    await page.keyboard.press('Control+f')
    await expect(page.getByPlaceholder(/Search entries/i)).toBeFocused()
  })

  test('lock button redirects to unlock', async ({ page }) => {
    await openFreshDb(page)
    await page.getByRole('button', { name: /Lock/i }).click()
    await expect(page).toHaveURL(/unlock/)
  })
})
