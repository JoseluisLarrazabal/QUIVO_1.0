const fs = require('fs');
const path = require('path');

// Dimensiones recomendadas para iconos
const ICON_DIMENSIONS = {
  icon: { width: 1024, height: 1024 },
  adaptiveIcon: { width: 1024, height: 1024 },
  splashIcon: { width: 2048, height: 2048 }
};

// Función para verificar dimensiones de imagen
function checkImageDimensions(imagePath) {
  try {
    const stats = fs.statSync(imagePath);
    const sizeInKB = Math.round(stats.size / 1024);
    console.log(`📁 ${path.basename(imagePath)}:`);
    console.log(`   Tamaño: ${sizeInKB} KB`);
    
    // Nota: Para obtener dimensiones exactas necesitarías una librería como sharp
    // Por ahora solo verificamos que el archivo existe
    if (fs.existsSync(imagePath)) {
      console.log(`   ✅ Archivo encontrado`);
    } else {
      console.log(`   ❌ Archivo no encontrado`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ Error al verificar ${imagePath}: ${error.message}`);
  }
}

// Función principal
function main() {
  console.log('🔍 Verificando iconos de la aplicación...\n');
  
  const imagesDir = path.join(__dirname, '../assets/images');
  
  // Verificar cada icono
  checkImageDimensions(path.join(imagesDir, 'icon.png'));
  checkImageDimensions(path.join(imagesDir, 'adaptive-icon.png'));
  checkImageDimensions(path.join(imagesDir, 'splash-icon.png'));
  
  console.log('📋 Dimensiones recomendadas:');
  console.log('   • icon.png: 1024x1024 px');
  console.log('   • adaptive-icon.png: 1024x1024 px');
  console.log('   • splash-icon.png: 2048x2048 px');
  console.log('');
  console.log('💡 Para optimizar las imágenes:');
  console.log('   1. Usa herramientas como Figma, Photoshop o GIMP');
  console.log('   2. Exporta en formato PNG con transparencia');
  console.log('   3. Asegúrate de que el contenido esté centrado');
  console.log('   4. Para Android, deja espacio alrededor del icono');
}

if (require.main === module) {
  main();
}

module.exports = { checkImageDimensions, ICON_DIMENSIONS }; 