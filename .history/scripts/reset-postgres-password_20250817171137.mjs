import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔐 PostgreSQL Password Reset Helper');
console.log('='.repeat(50));

console.log('\n📋 Common PostgreSQL Default Passwords:');
console.log('1. postgres');
console.log('2. admin');
console.log('3. password');
console.log('4. 123456');
console.log('5. (empty - no password)');

console.log('\n💡 To reset your PostgreSQL password:');
console.log('1. Open Command Prompt as Administrator');
console.log('2. Navigate to PostgreSQL bin directory:');
console.log('   cd "C:\\Program Files\\PostgreSQL\\17\\bin"');
console.log('3. Reset password:');
console.log('   psql -U postgres -c "ALTER USER postgres PASSWORD \'newpassword\';"');

console.log('\n🔧 Alternative: Use pgAdmin');
console.log('1. Open pgAdmin');
console.log('2. Right-click on PostgreSQL server');
console.log('3. Select "Properties"');
console.log('4. Go to "Connection" tab');
console.log('5. Check the username/password');

console.log('\n📝 Update your .env file with the correct password:');
console.log('DATABASE_URL="postgresql://postgres:CORRECT_PASSWORD@localhost:5432/kia_ora_db"');

console.log('\n🧪 Test different passwords:');
console.log('Try updating your .env file with these variations:');
console.log('- postgres:postgres@localhost:5432/kia_ora_db');
console.log('- postgres:admin@localhost:5432/kia_ora_db');
console.log('- postgres:password@localhost:5432/kia_ora_db');
console.log('- postgres:@localhost:5432/kia_ora_db (no password)');

console.log('\n✅ After fixing the password, run:');
console.log('node scripts/db-connection-test.mjs');
