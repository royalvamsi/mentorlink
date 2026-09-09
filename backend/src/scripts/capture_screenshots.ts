import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../../docs/screenshots')
const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:5000/api'

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
  }

  console.log('📸 Starting Screenshot Capture Pipeline...')

  await mongoose.connect(process.env.MONGO_URI!)
  const db = mongoose.connection.db!

  const demoEmail = 'screenshot_demo@college.edu'
  const password = 'DemoPassword123!'

  // Check if user exists
  const existingUser = await db.collection('users').findOne({ email: demoEmail })
  if (!existingUser) {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo Administrator', email: demoEmail, password, role: 'SENIOR' }),
    })
    const regData = (await regRes.json()) as any
    await db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(regData.data.user.id) },
      { $set: { role: 'ADMIN' } }
    )
  } else {
    await db.collection('users').updateOne(
      { email: demoEmail },
      { $set: { role: 'ADMIN' } }
    )
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  })

  const page = await browser.newPage()

  try {
    // 1. Landing Page (Public visitor view)
    console.log('Capturing: 01_landing_page.png...')
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => localStorage.clear())
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1000))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_landing_page.png') })
    console.log('✔ Captured Landing Page')

    // 2. Perform Real UI Login
    console.log('Logging in via UI...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' })
    await page.type('input[type="email"]', demoEmail)
    await page.type('input[type="password"]', password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1200))
    console.log('✔ Logged in. Current URL:', page.url())

    // 3. Mentor Discovery Page
    console.log('Capturing: 02_mentor_discovery.png...')
    await page.goto(`${BASE_URL}/mentors`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_mentor_discovery.png') })
    console.log('✔ Captured Mentor Discovery')

    // 4. Mentorship Hub
    console.log('Capturing: 03_mentorship_hub.png...')
    await page.goto(`${BASE_URL}/mentorships`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_mentorship_hub.png') })
    console.log('✔ Captured Mentorship Hub')

    // 5. Campus Forum
    console.log('Capturing: 04_campus_forum.png...')
    await page.goto(`${BASE_URL}/forum`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_campus_forum.png') })
    console.log('✔ Captured Campus Forum')

    // 6. Admin Console
    console.log('Capturing: 05_admin_console.png...')
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 1500))
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_admin_console.png') })
    console.log('✔ Captured Admin Console')

    console.log('🎉 All screenshots successfully refreshed!')
  } finally {
    await browser.close()
    await mongoose.disconnect()
  }
}

main().catch(console.error)
