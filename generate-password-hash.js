// Generate password hash for admin123
import bcrypt from 'bcryptjs';

async function generatePasswordHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Verify the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid);
}

generatePasswordHash();