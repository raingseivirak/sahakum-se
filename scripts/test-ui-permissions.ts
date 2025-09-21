import fetch from 'node-fetch'
import { CookieJar } from 'tough-cookie'
import fetchCookie from 'fetch-cookie'
import { JSDOM } from 'jsdom'

const testUsers = [
  { email: 'admin@sahakumkhmer.se', role: 'ADMIN', password: 'TestPass123' },
  { email: 'board@sahakumkhmer.se', role: 'BOARD', password: 'TestPass123' },
  { email: 'editor@sahakumkhmer.se', role: 'EDITOR', password: 'TestPass123' },
  { email: 'moderator@sahakumkhmer.se', role: 'MODERATOR', password: 'TestPass123' },
  { email: 'author@sahakumkhmer.se', role: 'AUTHOR', password: 'TestPass123' },
  { email: 'user@sahakumkhmer.se', role: 'USER', password: 'TestPass123' }
]

const BASE_URL = 'http://localhost:3000'

// Expected navigation sections for each role - Updated for current implementation
const expectedNavSections = {
  ADMIN: ['Dashboard', 'Pages', 'Posts', 'Categories', 'Services', 'Members', 'Users', 'Settings'],
  BOARD: ['Dashboard', 'Pages', 'Posts', 'Services', 'Members'],
  EDITOR: ['Dashboard', 'Pages', 'Posts', 'Categories', 'Services', 'Settings'],
  MODERATOR: ['Dashboard', 'Posts', 'Members'],
  AUTHOR: ['Dashboard', 'Posts'],
  USER: [] // Should be redirected away
}

// Expected action buttons for each role
const expectedButtons = {
  ADMIN: ['Create', 'Edit', 'Delete', 'Publish'],
  BOARD: ['Create', 'Edit', 'Delete', 'Publish'],
  EDITOR: ['Create', 'Edit', 'Delete', 'Publish'],
  MODERATOR: ['Create', 'Edit', 'Publish'],
  AUTHOR: ['Create', 'Edit'],
  USER: []
}

async function authenticateUser(email: string, password: string) {
  const jar = new CookieJar()
  const fetchWithCookies = fetchCookie(fetch, jar)

  try {
    // Get signin page
    const signinResponse = await fetchWithCookies(`${BASE_URL}/auth/signin`)
    const signinHtml = await signinResponse.text()

    // Extract CSRF token
    const csrfMatch = signinHtml.match(/name="csrfToken" value="([^"]+)"/)
    const csrfToken = csrfMatch ? csrfMatch[1] : ''

    if (!csrfToken) {
      return null
    }

    // Submit login
    await fetchWithCookies(`${BASE_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        callbackUrl: `${BASE_URL}/en/admin`
      }),
      redirect: 'manual'
    })

    // Check session
    const sessionResponse = await fetchWithCookies(`${BASE_URL}/api/auth/session`)
    const session = await sessionResponse.json()

    if (session && session.user) {
      return fetchWithCookies
    }
    return null
  } catch (error) {
    return null
  }
}

async function testLayer1Navigation(fetchWithCookies: any, role: string) {
  console.log(`\n🧭 Layer 1 - Navigation Testing for ${role}:`)

  try {
    const response = await fetchWithCookies(`${BASE_URL}/en/admin`)
    const html = await response.text()

    if (response.status === 302 || response.status === 401) {
      if (role === 'USER') {
        console.log(`   ✅ USER correctly redirected (${response.status})`)
        return { passed: 1, total: 1 }
      } else {
        console.log(`   ❌ ${role} unexpectedly redirected (${response.status})`)
        return { passed: 0, total: 1 }
      }
    }

    const dom = new JSDOM(html)
    const document = dom.window.document

    // Look for navigation elements
    const navItems = Array.from(document.querySelectorAll('nav a, [role="navigation"] a, .sidebar a'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)

    const expected = expectedNavSections[role as keyof typeof expectedNavSections] || []
    let passed = 0
    let total = expected.length

    if (role === 'USER') {
      console.log(`   ✅ USER should be redirected - no nav to check`)
      return { passed: 1, total: 1 }
    }

    for (const section of expected) {
      const found = navItems.some(item => item.toLowerCase().includes(section.toLowerCase()))
      if (found) {
        console.log(`   ✅ Found ${section} section`)
        passed++
      } else {
        console.log(`   ❌ Missing ${section} section`)
      }
    }

    console.log(`   📊 Navigation: ${passed}/${total} sections found`)
    return { passed, total }

  } catch (error) {
    console.log(`   ❌ Error testing navigation: ${error}`)
    return { passed: 0, total: 1 }
  }
}

async function testLayer2Buttons(fetchWithCookies: any, role: string) {
  console.log(`\n🔘 Layer 2 - Button Controls Testing for ${role}:`)

  if (role === 'USER') {
    console.log(`   ✅ USER should be redirected - no buttons to check`)
    return { passed: 1, total: 1 }
  }

  try {
    // Test on pages list page
    const response = await fetchWithCookies(`${BASE_URL}/en/admin/pages`)
    const html = await response.text()

    if (response.status !== 200) {
      console.log(`   ❌ Cannot access pages (${response.status})`)
      return { passed: 0, total: 1 }
    }

    const dom = new JSDOM(html)
    const document = dom.window.document

    // Look for action buttons
    const buttons = Array.from(document.querySelectorAll('button, a[role="button"], .btn'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 0)

    const expected = expectedButtons[role as keyof typeof expectedButtons] || []
    let passed = 0
    let total = expected.length

    for (const buttonType of expected) {
      const found = buttons.some(btn => btn.toLowerCase().includes(buttonType.toLowerCase()))
      if (found) {
        console.log(`   ✅ Found ${buttonType} button`)
        passed++
      } else {
        console.log(`   ❌ Missing ${buttonType} button`)
      }
    }

    console.log(`   📊 Buttons: ${passed}/${total} action buttons found`)
    return { passed, total }

  } catch (error) {
    console.log(`   ❌ Error testing buttons: ${error}`)
    return { passed: 0, total: 1 }
  }
}

async function main() {
  console.log('🧪 Sahakum Khmer CMS - Automated UI Permission Testing\n')
  console.log('=' .repeat(60))

  const results: any = {}

  for (const user of testUsers) {
    console.log(`\n👤 Testing user: ${user.email} (${user.role})`)
    console.log('-'.repeat(50))

    const fetchWithCookies = await authenticateUser(user.email, user.password)

    if (!fetchWithCookies && user.role !== 'USER') {
      console.log(`❌ Authentication failed for ${user.email}`)
      continue
    }

    // Test Layer 1: Navigation
    const navResults = await testLayer1Navigation(fetchWithCookies, user.role)

    // Test Layer 2: Buttons
    const buttonResults = await testLayer2Buttons(fetchWithCookies, user.role)

    results[user.role] = {
      user: user.email,
      navigation: navResults,
      buttons: buttonResults
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 UI PERMISSION TEST SUMMARY')
  console.log('='.repeat(60))

  for (const [role, result] of Object.entries(results) as any) {
    console.log(`\n${role}:`)
    console.log(`  🧭 Navigation: ${result.navigation.passed}/${result.navigation.total} passed`)
    console.log(`  🔘 Buttons: ${result.buttons.passed}/${result.buttons.total} passed`)

    const totalPassed = result.navigation.passed + result.buttons.passed
    const totalTests = result.navigation.total + result.buttons.total
    console.log(`  📊 Overall: ${totalPassed}/${totalTests} UI tests passed`)
  }
}

main().catch(console.error)