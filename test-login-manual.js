const testUsers = [
  { email: 'admin@sahakumkhmer.se', role: 'ADMIN', password: 'TestPass123' },
  { email: 'editor@sahakumkhmer.se', role: 'EDITOR', password: 'TestPass123' },
  { email: 'author@sahakumkhmer.se', role: 'AUTHOR', password: 'TestPass123' },
  { email: 'user@sahakumkhmer.se', role: 'USER', password: 'TestPass123' }
]

async function testAuthentication() {
  console.log('🧪 Testing Authentication & Permission System\n')

  for (const user of testUsers) {
    console.log(`👤 Testing ${user.email} (${user.role}):`)

    try {
      // Test 1: Try to access admin dashboard directly (should redirect if not logged in)
      const adminResponse = await fetch('http://localhost:3000/en/admin')
      console.log(`   Admin access: ${adminResponse.status} (${adminResponse.status === 302 ? 'Redirected' : 'Direct access'})`)

      // Test 2: Try API endpoints (should get 401)
      const apiTests = [
        { endpoint: '/api/pages', minRole: 'EDITOR' },
        { endpoint: '/api/posts', minRole: 'AUTHOR' },
        { endpoint: '/api/users', minRole: 'ADMIN' },
        { endpoint: '/api/membership-requests', minRole: 'BOARD' }
      ]

      for (const test of apiTests) {
        const apiResponse = await fetch(`http://localhost:3000${test.endpoint}`)
        console.log(`   ${test.endpoint}: ${apiResponse.status} (${test.minRole}+ required)`)
      }

    } catch (error) {
      console.log(`   ❌ Error testing ${user.email}: ${error.message}`)
    }

    console.log('')
  }

  console.log('🎯 Manual Testing Instructions:')
  console.log('=' .repeat(50))
  console.log('1. Open: http://localhost:3000/auth/signin')
  console.log('2. Try each user with password: TestPass123')
  console.log('3. Check what sections appear in admin dashboard')
  console.log('4. Check what buttons are enabled/disabled')
  console.log('')
  console.log('Expected Results:')
  console.log('• ADMIN: See all sections, all buttons')
  console.log('• EDITOR: See content + org sections')
  console.log('• AUTHOR: See only content sections')
  console.log('• USER: Should be redirected away from admin')
}

testAuthentication().catch(console.error)