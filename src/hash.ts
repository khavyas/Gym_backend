import bcrypt from 'bcrypt';

async function generateHash() {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('1234', salt);
  console.log('Hashed password:', hashed);
}

generateHash();
