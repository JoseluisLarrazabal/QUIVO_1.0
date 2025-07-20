#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno para Rate Limiting...\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

// Variables que necesitamos agregar
const requiredVars = {
  'RATE_LIMIT_MAX': '100',
  'TEST_RATE_LIMIT_MAX': '100'
};

// Leer el archivo .env actual
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Archivo .env encontrado');
} catch (error) {
  console.log('❌ Archivo .env no encontrado, creando uno nuevo...');
  envContent = '';
}

// Verificar si las variables ya existen
const missingVars = [];
for (const [key, value] of Object.entries(requiredVars)) {
  if (!envContent.includes(`${key}=`)) {
    missingVars.push({ key, value });
  }
}

if (missingVars.length === 0) {
  console.log('✅ Todas las variables de rate limiting ya están configuradas');
} else {
  console.log('📝 Agregando variables faltantes...\n');
  
  // Agregar las variables faltantes
  let newContent = envContent;
  
  // Buscar la sección de Rate Limiting
  if (newContent.includes('# Rate Limiting')) {
    // Insertar después de la sección existente
    const rateLimitSection = newContent.indexOf('# Rate Limiting');
    const nextSection = newContent.indexOf('\n#', rateLimitSection + 1);
    const insertPosition = nextSection > -1 ? nextSection : newContent.length;
    
    const varsToAdd = missingVars.map(v => `${v.key}=${v.value}`).join('\n');
    newContent = newContent.slice(0, insertPosition) + '\n' + varsToAdd + newContent.slice(insertPosition);
  } else {
    // Agregar nueva sección al final
    const varsToAdd = missingVars.map(v => `${v.key}=${v.value}`).join('\n');
    newContent += `\n# Rate Limiting (configuración actualizada)\n${varsToAdd}\n`;
  }
  
  // Crear backup del archivo original
  const backupPath = envPath + '.backup.' + Date.now();
  fs.writeFileSync(backupPath, envContent);
  console.log(`💾 Backup creado en: ${backupPath}`);
  
  // Escribir el nuevo contenido
  fs.writeFileSync(envPath, newContent);
  
  console.log('✅ Variables agregadas exitosamente:');
  missingVars.forEach(v => {
    console.log(`   ${v.key}=${v.value}`);
  });
}

console.log('\n🎉 Configuración completada!');
console.log('\n📋 Variables configuradas:');
console.log('   RATE_LIMIT_MAX=100 (producción)');
console.log('   TEST_RATE_LIMIT_MAX=100 (tests)');
console.log('\n🚀 Puedes ejecutar "npm test" para verificar que todo funciona correctamente.'); 