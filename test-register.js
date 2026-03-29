import fetch from 'node-fetch';

const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:4322/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'test123',
        role: 'user'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Data:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
};

testRegister();