// Quick test to verify UUID generation works
const crypto = require('expo-crypto');

console.log('Testing UUID generation:');
for (let i = 0; i < 5; i++) {
  const uuid = crypto.randomUUID();
  console.log(`UUID ${i + 1}: ${uuid}`);
}
