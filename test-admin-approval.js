async function testAdminWorkflow() {
  const requestId = 'cmfky6vpn0000l08j4i3a0751' // Our test request ID

  try {
    console.log('🧪 Testing Admin Approval Workflow...\n')

    // Step 1: Get the current request details
    console.log('📋 Step 1: Getting request details...')
    const getResponse = await fetch(`http://localhost:3001/api/membership-requests/${requestId}`)
    const request = await getResponse.json()

    console.log(`✅ Request found: ${request.requestNumber}`)
    console.log(`   Applicant: ${request.firstName} ${request.lastName}`)
    console.log(`   Status: ${request.status}`)
    console.log(`   Email: ${request.email}\n`)

    // Step 2: Update status to UNDER_REVIEW
    console.log('🔍 Step 2: Moving to Under Review...')
    const updateResponse = await fetch(`http://localhost:3001/api/membership-requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin' // Mock auth
      },
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        adminNotes: 'Initial review completed. All documents appear to be in order.'
      })
    })

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json()
      console.log(`✅ Status updated to: ${updateResult.request.status}`)
      console.log(`   Admin notes added\n`)
    } else {
      console.log(`❌ Failed to update status: ${updateResponse.status}`)
      const errorData = await updateResponse.json()
      console.log(`   Error: ${errorData.error}\n`)
    }

    // Step 3: Approve and create member (this will require authentication in real scenario)
    console.log('✅ Step 3: Approving request and creating member...')
    const approvalResponse = await fetch(`http://localhost:3001/api/membership-requests/${requestId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-admin' // Mock auth
      },
      body: JSON.stringify({
        adminNotes: 'Approved after verification of residence status and motivation.'
      })
    })

    if (approvalResponse.ok) {
      const approvalResult = await approvalResponse.json()
      console.log(`✅ Request approved successfully!`)
      console.log(`   Member ID: ${approvalResult.memberId}`)
      console.log(`   Member Number: ${approvalResult.memberNumber}`)
      console.log(`   Status: ${approvalResult.request.status}\n`)
    } else {
      console.log(`❌ Failed to approve request: ${approvalResponse.status}`)
      const errorData = await approvalResponse.json()
      console.log(`   Error: ${errorData.error}\n`)
    }

    // Step 4: Verify final state
    console.log('🔍 Step 4: Verifying final state...')
    const finalGetResponse = await fetch(`http://localhost:3001/api/membership-requests/${requestId}`)
    const finalRequest = await finalGetResponse.json()

    console.log(`📊 Final Request State:`)
    console.log(`   Status: ${finalRequest.status}`)
    console.log(`   Created Member ID: ${finalRequest.createdMemberId || 'None'}`)
    console.log(`   Admin Notes: ${finalRequest.adminNotes || 'None'}`)

    if (finalRequest.createdMember) {
      console.log(`   ✅ Member Created: ${finalRequest.createdMember.memberNumber}`)
    }

    console.log('\n🎉 Admin workflow test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAdminWorkflow()