const mysql = require('mysql2/promise');

async function checkOrderConstraints() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'amoli_jewelry'
  });

  try {
    console.log('🔍 Checking Order table constraints...\n');
    
    // Get table structure
    const [tableInfo] = await connection.execute('DESCRIBE `order`');
    console.log('📋 Order table structure:');
    tableInfo.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
    });
    
    // Get table creation statement
    const [createTable] = await connection.execute('SHOW CREATE TABLE `order`');
    console.log('\n📝 Order table creation statement:');
    console.log(createTable[0]['Create Table']);
    
    // Check existing orders to understand the pattern
    const [existingOrders] = await connection.execute('SELECT * FROM `order` LIMIT 3');
    console.log('\n📊 Existing order samples:');
    existingOrders.forEach(order => {
      console.log(`  Order ${order.orderNumber}: shippingAddress length = ${order.shippingAddress ? order.shippingAddress.length : 'NULL'}`);
    });
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkOrderConstraints();