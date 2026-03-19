const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
console.log(Object.keys(p).filter(k => !k.startsWith('_') && !k.startsWith('$')));
p.$disconnect();
