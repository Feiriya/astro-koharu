import bcrypt from 'bcryptjs';

const password = '409044722';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash:', hash);