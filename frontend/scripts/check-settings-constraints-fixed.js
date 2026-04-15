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
    
    // Get table creation statement to see constraints
    const [createTable] = await connection.execute('SHOW CREATE TABLE settings');
    console.log('\n📝 Table creation statement:');
    console.log(createTable[0]['Create Table']);
    
    // Try to understand why inserts are failing
    console.log('\n🧪 Testing insert with existing pattern...');
    
    // Check existing data pattern
    const [existingData] = await connection.execute('SELECT * FROM settings LIMIT 3');
    console.log('\n📊 Existing data samples:');
    existingData.forEach(row => {
      console.log(`  ${row.key}: "${row.value}" (ID: ${row.id})`);
    });
    
    // Try direct MySQL insert
    try {
      const testId = 'test-' + Date.now();
      await connection.execute(
        'INSERT INTO settings (id, `key`, value, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [testId, 'test_direct_insert', 'test_value']
      );
      console.log('\n✅ Direct MySQL insert: SUCCESS');
      
      // Clean up
      await connection.execute('DELETE FROM settings WHERE id = ?', [testId]);
      console.log('✅ Cleanup: SUCCESS');
      
    } catch (error) {
      console.log('\n❌ Direct MySQL insert failed:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSettingsTable();