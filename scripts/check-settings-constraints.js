const mysql = require('mysql2/promise');

async function checkSettingsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'amoli_jewelry'
  });

  try {
    console.log('🔍 Checking Settings table constraints...\n');
    
    // Get table structure
    const [tableInfo] = await connection.execute('DESCRIBE settings');
    console.log('📋 Table structure:');
    tableInfo.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });
    
    // Check for constraints
    const [constraints] = await connection.execute(`
      SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, CHECK_CLAUSE 
      FROM information_schema.CHECK_CONSTRAINTS 
      WHERE TABLE_SCHEMA = 'amoli_jewelry' AND TABLE_NAME = 'settings'
    `);
    
    console.log('\n🔒 Check constraints:');
    if (constraints.length > 0) {
      constraints.forEach(constraint => {
        console.log(`  ${constraint.CONSTRAINT_NAME}: ${constraint.CHECK_CLAUSE}`);
      });
    } else {
      console.log('  No check constraints found');
    }
    
    // Get table creation statement
    const [createTable] = await connection.execute('SHOW CREATE TABLE settings');
    console.log('\n📝 Table creation statement:');
    console.log(createTable[0]['Create Table']);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSettingsTable();