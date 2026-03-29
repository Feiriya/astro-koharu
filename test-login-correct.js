// Test CMS login API with correct password
async function testLogin() {
  const loginUrl = 'http://localhost:4322/api/auth/login';
  
  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLogin();