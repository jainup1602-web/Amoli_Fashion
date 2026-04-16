require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const url = process.env.DATABASE_URL;
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  const [, user, password, host, port, database] = match;

  const conn = await mysql.createConnection({
    host, port: parseInt(port), user, password, database,
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected to Railway MySQL!');

  const content = fs.readFileSync('amoli_jewelry.sql', 'utf8');
  const lines = content.split('\n');

  const insertLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('INSERT INTO')) {
      insertLines.push({ table: lines[i].match(/INSERT INTO `(\w+)`/)?.[1], line: i });
    }
  }

  console.log(`Found ${insertLines.length} INSERT statements`);

  await conn.query('SET FOREIGN_KEY_CHECKS=0');

  for (const { table, line } of insertLines) {
    let stmt = '';
    let i = line;
    while (i < lines.length) {
      stmt += lines[i] + '\n';
      if (lines[i].endsWith(';')) break;
      i++;
    }
    if (!stmt.trim()) continue;

    try {
      const [result] = await conn.query(stmt);
      console.log(`✅ ${table}: ${result.affectedRows} rows`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️  ${table}: already exists`);
      } else {
        console.log(`❌ ${table}: ${err.message.substring(0, 80)}`);
      }
    }
  }

  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  await conn.end();
  console.log('\nImport complete!');
}

main().catch(console.error);
