// Create MySQL Database
const mysql = require('mysql2/promise');

async function createDatabase() {
  console.log('🔧 Creating MySQL Database...\n');
  
  try {
    // Connect without database - try different passwords
    let connection;
    const passwords = ['', 'root', 'password', 'admin'];
    
    for (const pwd of passwords) {
      try {
        console.log(`Trying password: ${pwd || '(empty)'}...`);
        connection = await mysql.createConnection({
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: pwd
        });
        console.log(`✅ Connected with password: ${pwd || '(empty)'}\n`);
        
        // Update .env file
        console.log('📝 Update your .env file with:');
        if (pwd) {
          console.log(`DATABASE_URL="mysql://root:${pwd}@localhost:3306/amoli_jewelry"\n`);
        } else {
          console.log(`DATABASE_URL="mysql://root@localhost:3306/amoli_jewelry"\n`);
        }
        break;
      } catch (err) {
        if (!connection) continue;
      }
    }
    
    if (!connection) {
      throw new Error('Could not connect with any password');
    }

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS amoli_jewelry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "amoli_jewelry" created successfully!');

    // Show databases
    const [databases] = await connection.query('SHOW DATABASES');
    console.log('\n📋 Available databases:');
    databases.forEach(db => {
      if (db.Database === 'amoli_jewelry') {
        console.log(`  ✓ ${db.Database} (READY)`);
      } else {
        console.log(`    ${db.Database}`);
      }
    });

    await connection.end();
    
    console.log('\n✅ Setup complete! Now run:');
    console.log('   npx prisma db push\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('1. Make sure XAMPP MySQL is running');
    console.log('2. Check if password is required (try password: "root")');
    console.log('3. Open phpMyAdmin: http://localhost/phpmyadmin');
  }
}

createDatabase();
