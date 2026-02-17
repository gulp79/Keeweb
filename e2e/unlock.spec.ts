import { test, expect } from '@playwright/test'

test.describe('Unlock page', () => {
  test('redirects to /unlock by default', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/unlock/)
  })

  test('shows app title', async ({ page }) => {
    await page.goto('/unlock')
    await expect(page.getByText('KeePass Web').first()).toBeVisible()
  })

  test('switches to Create mode', async ({ page }) => {
    await page.goto('/unlock')
    await page.getByText('New Database').click()
    await expect(page.getByLabel('Database Name')).toBeVisible()
  })

  test('can create a new database', async ({ page }) => {
    await page.goto('/unlock')
    await page.getByText('New Database').click()
    await page.getByLabel('Database Name').fill('Test DB')
    await page.getByLabel('Master Password').fill('TestPassword123!')
    await page.getByRole('button', { name: /Create Database/i }).click()
    await expect(page).toHaveURL(/\/db\//)
  })
})
