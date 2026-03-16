const crypto = require('crypto');

// Генератор JWT секрета
function generateJWTSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 JWT Secret Generator');
console.log('======================');
console.log('');
console.log('Сгенерированный JWT секрет (используйте в Railway):');
console.log('');
console.log(generateJWTSecret());
console.log('');
console.log('⚠️  ВАЖНО:');
console.log('- Скопируйте этот секрет и сохраните в безопасном месте');
console.log('- Никому не показывайте этот секрет');
console.log('- Если секрет скомпрометирован - сгенерируйте новый');
console.log('- Все существующие JWT токены станут недействительными');
console.log('');
console.log('💡 Советы по безопасности:');
console.log('- Используйте секрет длиной не менее 32 символов');
console.log('- Регулярно меняйте секрет (раз в 3-6 месяцев)');
console.log('- Храните секрет в безопасном месте');
console.log('- Не коммитьте секрет в репозиторий');
console.log('');
console.log('Для генерации нового секрета запустите: node generate-secret.js');