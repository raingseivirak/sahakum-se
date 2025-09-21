import fetch from 'node-fetch'
import { CookieJar } from 'tough-cookie'
import fetchCookie from 'fetch-cookie'

// Test users with their credentials - All test users now exist in database
const testUsers = [
  { email: 'admin@sahakumkhmer.se', role: 'ADMIN', password: 'TestPass123' },
  { email: 'board@sahakumkhmer.se', role: 'BOARD', password: 'TestPass123' },
  { email: 'editor@sahakumkhmer.se', role: 'EDITOR', password: 'TestPass123' },
  { email: 'moderator@sahakumkhmer.se', role: 'MODERATOR', password: 'TestPass123' },
  { email: 'author@sahakumkhmer.se', role: 'AUTHOR', password: 'TestPass123' },
  { email: 'user@sahakumkhmer.se', role: 'USER', password: 'TestPass123' }
]

const BASE_URL = 'http://localhost:3000'

// API endpoints to test (Layer 3) - Updated with current implementation
const apiEndpoints = [
  { path: '/api/pages', description: 'Pages management API', minRole: 'EDITOR' },
  { path: '/api/posts', description: 'Posts management API', minRole: 'AUTHOR' },
  { path: '/api/members', description: 'Members management API', minRole: 'EDITOR' },
  { path: '/api/membership-requests', description: 'Membership requests API', minRole: 'BOARD' },
  { path: '/api/users', description: 'Users management API', minRole: 'ADMIN' },
  { path: '/api/media', description: 'Media management API', minRole: 'EDITOR' },
  { path: '/api/services', description: 'Services management API', minRole: 'EDITOR' },
  { path: '/api/categories', description: 'Categories management API', minRole: 'EDITOR' },
  { path: '/api/settings', description: 'Settings management API', minRole: 'EDITOR' }
]

// Role hierarchy for permission checking
const roleHierarchy = ['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']

function hasPermission(userRole: string, requiredRole: string): boolean {
  const userIndex = roleHierarchy.indexOf(userRole)
  const requiredIndex = roleHierarchy.indexOf(requiredRole)
  return userIndex >= requiredIndex
}

async function authenticateUser(email: string, password: string) {
  const jar = new CookieJar()
  const fetchWithCookies = fetchCookie(fetch, jar)

  try {
    // First get the signin page to get CSRF token
    const signinResponse = await fetchWithCookies(`${BASE_URL}/auth/signin`)
    const signinHtml = await signinResponse.text()

    // Extract CSRF token (simplified - might need more robust extraction)
    const csrfMatch = signinHtml.match(/name="csrfToken" value="([^"]+)"/)
    const csrfToken = csrfMatch ? csrfMatch[1] : ''

    if (!csrfToken) {
      console.log(`❌ Could not extract CSRF token for ${email}`)
      return null
    }

    // Submit login form
    const loginResponse = await fetchWithCookies(`${BASE_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        callbackUrl: `${BASE_URL}/en/admin`
      }),
      redirect: 'manual' // Don't follow redirects
    })

    // Check if we have a session
    const sessionResponse = await fetchWithCookies(`${BASE_URL}/api/auth/session`)
    const session = await sessionResponse.json()

    if (session && session.user) {
      console.log(`✅ Successfully authenticated: ${email} (${session.user.role})`)
      return fetchWithCookies
    } else {
      console.log(`❌ Authentication failed for: ${email}`)
      return null
    }
  } catch (error) {
    console.log(`❌ Error authenticating ${email}:`, error)
    return null
  }
}

async function testLayer3ApiProtection(fetchWithCookies: any, userRole: string) {
  const results: any[] = []

  console.log(`\n🔒 Layer 3 - API Protection Testing for ${userRole}:`)

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetchWithCookies(`${BASE_URL}${endpoint.path}`)
      const status = response.status
      const shouldHaveAccess = hasPermission(userRole, endpoint.minRole)

      let result = 'UNEXPECTED'
      if (shouldHaveAccess && (status === 200 || status === 404)) {
        result = 'PASS ✅'
      } else if (!shouldHaveAccess && (status === 401 || status === 403)) {
        result = 'PASS ✅'
      } else if (shouldHaveAccess && (status === 401 || status === 403)) {
        result = 'FAIL ❌ (Should have access)'
      } else if (!shouldHaveAccess && (status === 200 || status === 404)) {
        result = 'FAIL ❌ (Should be blocked)'
      }

      console.log(`   ${endpoint.description}: ${status} - ${result}`)

      results.push({
        endpoint: endpoint.path,
        status,
        expected: shouldHaveAccess ? 'ALLOW' : 'BLOCK',
        actual: (status === 200 || status === 404) ? 'ALLOW' : 'BLOCK',
        result
      })
    } catch (error) {
      console.log(`   ${endpoint.description}: ERROR - ${error}`)
      results.push({
        endpoint: endpoint.path,
        status: 'ERROR',
        expected: hasPermission(userRole, endpoint.minRole) ? 'ALLOW' : 'BLOCK',
        actual: 'ERROR',
        result: 'ERROR ⚠️'
      })
    }
  }

  return results
}

async function testPermissionsAPI(fetchWithCookies: any, userRole: string) {
  console.log(`\n📋 Permissions API Testing for ${userRole}:`)

  try {
    const response = await fetchWithCookies(`${BASE_URL}/api/admin/permissions`)

    if (response.status === 200) {
      const data = await response.json()
      console.log(`   ✅ Permissions API accessible`)
      console.log(`   Role: ${data.user.role}`)

      // Check key permissions
      const keyPermissions = [
        'canCreateContent',
        'canManageMembers',
        'canViewMembershipRequests',
        'canManageUsers'
      ]

      keyPermissions.forEach(perm => {
        const hasPermission = data.permissions[perm]
        console.log(`   ${perm}: ${hasPermission ? '✅' : '❌'}`)
      })

      return data.permissions
    } else {
      console.log(`   ❌ Permissions API blocked (${response.status})`)
      return null
    }
  } catch (error) {
    console.log(`   ❌ Error accessing permissions API:`, error)
    return null
  }
}

async function main() {
  console.log('🧪 Starting Comprehensive Permission System Testing\n')
  console.log('=' .repeat(60))

  const allResults: any = {}

  for (const user of testUsers) {
    console.log(`\n👤 Testing user: ${user.email} (${user.role})`)
    console.log('-'.repeat(50))

    // Authenticate user
    const fetchWithCookies = await authenticateUser(user.email, user.password)

    if (!fetchWithCookies) {
      console.log(`❌ Skipping tests for ${user.email} - authentication failed`)
      continue
    }

    // Test permissions API first
    const permissions = await testPermissionsAPI(fetchWithCookies, user.role)

    // Test Layer 3 - API Protection
    const apiResults = await testLayer3ApiProtection(fetchWithCookies, user.role)

    allResults[user.role] = {
      user: user.email,
      authenticated: true,
      permissions,
      apiResults
    }
  }

  // Summary Report
  console.log('\n' + '='.repeat(60))
  console.log('📊 PERMISSION SYSTEM TEST SUMMARY')
  console.log('='.repeat(60))

  for (const [role, results] of Object.entries(allResults) as any) {
    console.log(`\n${role}:`)

    if (results.authenticated) {
      console.log(`  ✅ Authentication: PASS`)

      // Count API test results
      const apiTests = results.apiResults || []
      const passed = apiTests.filter((r: any) => r.result.includes('✅')).length
      const failed = apiTests.filter((r: any) => r.result.includes('❌')).length
      const total = apiTests.length

      console.log(`  🔒 API Protection: ${passed}/${total} tests passed${failed > 0 ? `, ${failed} failed` : ''}`)

      if (results.permissions) {
        const permCount = Object.values(results.permissions).filter(Boolean).length
        console.log(`  📋 Permissions: ${permCount} permissions granted`)
      }
    } else {
      console.log(`  ❌ Authentication: FAILED`)
    }
  }

  console.log('\n🎯 Manual Testing Instructions:')
  console.log('1. Open browser and go to http://localhost:3000/auth/signin')
  console.log('2. Login with any test user (password: TestPass123)')
  console.log('3. Check Layer 1: Which navigation sections are visible?')
  console.log('4. Check Layer 2: Which buttons are enabled/disabled?')
  console.log('5. The API tests above verify Layer 3 protection')

  console.log('\n📝 Test Users Available:')
  testUsers.forEach(user => {
    console.log(`   • ${user.email} (${user.role})`)
  })
}

main().catch(console.error)