const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettingsConstraint() {
  try {
    console.log('🔍 Debugging Settings Model Constraint Issue...\n');
    
    // Check existing settings
    const existingSettings = await prisma.settings.findMany();
    console.log('📊 Existing settings count:', existingSettings.length);
    
    if (existingSettings.length > 0) {
      console.log('📋 Sample existing settings:');
      existingSettings.slice(0, 3).forEach(setting => {
        console.log(`  - ${setting.key}: "${setting.value}" (length: ${setting.value.length})`);
      });
    }
    
    console.log('\n🧪 Testing different value types...');
    
    // Test 1: Try with non-empty value
    try {
      const testSetting1 = await prisma.settings.create({
        data: {
          key: 'test_non_empty',
          value: 'non_empty_value'
        }
      });
      console.log('✅ Non-empty value: SUCCESS');
      await prisma.settings.delete({ where: { id: testSetting1.id } });
    } catch (error) {
      console.log('❌ Non-empty value failed:', error.message);
    }
    
    // Test 2: Try with empty string
    try {
      const testSetting2 = await prisma.settings.create({
        data: {
          key: 'test_empty',
          value: ''
        }
      });
      console.log('✅ Empty string: SUCCESS');
      await prisma.settings.delete({ where: { id: testSetting2.id } });
    } catch (error) {
      console.log('❌ Empty string failed:', error.message);
    }
    
    // Test 3: Try with null value (if allowed)
    try {
      const testSetting3 = await prisma.settings.create({
        data: {
          key: 'test_null',
          value: null
        }
      });
      console.log('✅ Null value: SUCCESS');
      await prisma.settings.delete({ where: { id: testSetting3.id } });
    } catch (error) {
      console.log('❌ Null value failed:', error.message);
    }
    
    console.log('\n💡 Constraint Analysis Complete');
    
  } catch (error) {
    console.log('❌ Debug error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettingsConstraint();