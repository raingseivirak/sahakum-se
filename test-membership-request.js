const testData = {
  firstName: "Test",
  lastName: "Applicant",
  firstNameKhmer: "តេស្ត",
  lastNameKhmer: "អ្នកស្នើសុំ",
  email: "test.applicant@example.com",
  phone: "+46 70 123 45 67",
  address: "123 Test Street",
  city: "Stockholm",
  postalCode: "123 45",
  country: "Sweden",
  residenceStatus: "STUDENT",
  motivation: "I want to connect with the Cambodian community in Sweden and learn more about my heritage.",
  hearAboutUs: "Friend recommendation",
  interests: "Cultural events, language classes",
  skills: "Programming, event organization",
  requestedMemberType: "REGULAR"
}

async function testMembershipRequest() {
  try {
    console.log('Testing membership request API...')

    const response = await fetch('http://localhost:3001/api/membership-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Membership request submitted successfully!')
      console.log('Request Number:', result.requestNumber)
      console.log('Request ID:', result.id)
    } else {
      console.log('❌ Error:', result.error)
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

testMembershipRequest()