const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSettingsWithJSON() {
  console.log('🧪 Testing Settings Model with JSON Values...\n');

  try {
    // Test CREATE with valid JSON string
    console.log('1️⃣ Testing CREATE with JSON string...');
    const testSetting = await prisma.settings.create({
      data: {
        key: 'test_json_setting',
        value: JSON.stringify('test_value') // Convert to JSON string
      }
    });
    console.log('✅ Settings CREATE with JSON: SUCCESS');

    // Test UPDATE with valid JSON
    console.log('2️⃣ Testing UPDATE with JSON...');
    const updatedSetting = await prisma.settings.update({
      where: { id: testSetting.id },
      data: { value: JSON.stringify('updated_test_value') }
    });
    console.log('✅ Settings UPDATE with JSON: SUCCESS');

    // Test with JSON object
    console.log('3️⃣ Testing with JSON object...');
    const jsonObjectSetting = await prisma.settings.create({
      data: {
        key: 'test_json_object',
        value: JSON.stringify({ setting: 'value', number: 123 })
      }
    });
    console.log('✅ Settings CREATE with JSON object: SUCCESS');

    // Test DELETE
    console.log('4️⃣ Testing DELETE...');
    await prisma.settings.delete({ where: { id: testSetting.id } });
    await prisma.settings.delete({ where: { id: jsonObjectSetting.id } });
    console.log('✅ Settings DELETE: SUCCESS');

    console.log('\n🎉 Settings Model: FULLY WORKING WITH JSON VALUES!');
    console.log('💡 Solution: All values must be valid JSON strings');

  } catch (error) {
    console.log('❌ Settings Model Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSettingsWithJSON();