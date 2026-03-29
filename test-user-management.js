import fetch from 'node-fetch';

const testUserManagement = async () => {
  try {
    // 首先登录获取token
    const loginResponse = await fetch('http://localhost:4322/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'Feiriya',
        password: '409044722'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    
    const token = loginData.token;
    
    // 测试获取用户列表
    const usersResponse = await fetch('http://localhost:4322/api/cms/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Users status:', usersResponse.status);
    const usersText = await usersResponse.text();
    console.log('Users response text:', usersText);
    
    if (usersResponse.ok) {
      const usersData = JSON.parse(usersText);
      console.log('Users data:', usersData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testUserManagement();