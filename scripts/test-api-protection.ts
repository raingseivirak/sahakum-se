import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

// API endpoints to test without authentication - these should all be protected now
const protectedEndpoints = [
  { path: '/api/pages', description: 'Pages management API (EDITOR+)' },
  { path: '/api/posts', description: 'Posts management API (AUTHOR+)' },
  { path: '/api/members', description: 'Members management API (EDITOR+)' },
  { path: '/api/membership-requests', description: 'Membership requests API (BOARD+)' },
  { path: '/api/users', description: 'Users management API (ADMIN only)' },
  { path: '/api/media', description: 'Media management API (EDITOR+)' },
  { path: '/api/services', description: 'Services management API (EDITOR+)' },
  { path: '/api/categories', description: 'Categories management API (EDITOR+)' },
  { path: '/api/settings', description: 'Settings management API (EDITOR+)' }
]

async function testApiProtection() {
  console.log('🔒 Testing API Protection Layer (Without Authentication)')
  console.log('=' .repeat(60))
  console.log('All endpoints should return 401 Unauthorized when not authenticated\n')

  let passedTests = 0
  let totalTests = protectedEndpoints.length

  for (const endpoint of protectedEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`)
      const status = response.status

      if (status === 401) {
        console.log(`✅ ${endpoint.description}: ${status} (Correctly protected)`)
        passedTests++
      } else if (status === 403) {
        console.log(`✅ ${endpoint.description}: ${status} (Correctly protected)`)
        passedTests++
      } else {
        console.log(`❌ ${endpoint.description}: ${status} (Should be protected!)`)
      }
    } catch (error) {
      console.log(`⚠️  ${endpoint.description}: ERROR - ${error}`)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`📊 API Protection Test Results: ${passedTests}/${totalTests} passed`)

  if (passedTests === totalTests) {
    console.log('✅ All API endpoints are properly protected!')
  } else {
    console.log('❌ Some endpoints may have security issues')
  }
}

async function testPublicEndpoints() {
  console.log('\n🌐 Testing Public API Endpoints')
  console.log('=' .repeat(60))
  console.log('These endpoints should be accessible without authentication\n')

  const publicEndpoints = [
    { path: '/api/public/pages', description: 'Public pages API' },
    { path: '/api/public/posts', description: 'Public posts API' },
    { path: '/api/public/services', description: 'Public services API' },
    { path: '/api/auth/session', description: 'Session check API' }
  ]

  for (const endpoint of publicEndpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`)
      const status = response.status

      if (status === 200 || status === 404) {
        console.log(`✅ ${endpoint.description}: ${status} (Accessible)`)
      } else {
        console.log(`⚠️  ${endpoint.description}: ${status} (May need review)`)
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description}: ERROR - ${error}`)
    }
  }
}

async function main() {
  console.log('🧪 Sahakum Khmer CMS - API Protection Testing\n')

  try {
    await testApiProtection()
    await testPublicEndpoints()

    console.log('\n🎯 Manual Testing Instructions:')
    console.log('=' .repeat(60))
    console.log('1. Open browser: http://localhost:3000/auth/signin')
    console.log('2. Test users (password: admin123):')
    console.log('   • admin@sahakumkhmer.se (ADMIN) - Should see all sections')
    console.log('   • Any authenticated user with proper role')
    console.log('   NOTE: Use the real admin password from your system')
    console.log('\n📋 What to Check:')
    console.log('   Layer 1: Navigation menu sections visible')
    console.log('   Layer 2: Create/Edit/Delete buttons enabled/disabled')
    console.log('   Layer 3: API responses (tested above)')

  } catch (error) {
    console.error('Error running tests:', error)
  }
}

main()