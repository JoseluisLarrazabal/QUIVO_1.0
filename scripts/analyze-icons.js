const fs = require('fs');
const path = require('path');

// Configuración de dimensiones requeridas
const REQUIRED_DIMENSIONS = {
  icon: { width: 1024, height: 1024, name: 'Icono Principal' },
  adaptiveIcon: { width: 1080, height: 1080, name: 'Icono Adaptativo' },
  splash: { width: 1242, height: 2436, name: 'Splash Screen' }
};

// Función para obtener dimensiones de imagen usando sharp o análisis básico
function getImageDimensions(imagePath) {
  try {
    // Leer los primeros bytes del archivo para obtener información básica
    const buffer = fs.readFileSync(imagePath);
    
    // Análisis básico de PNG (buscar IHDR chunk)
    const pngSignature = buffer.toString('hex', 0, 8);
    if (pngSignature !== '89504e470d0a1a0a') {
      return null; // No es un PNG válido
    }
    
    // Buscar el chunk IHDR (contiene dimensiones)
    const ihdrOffset = buffer.indexOf(Buffer.from('IHDR', 'ascii'));
    if (ihdrOffset === -1) {
      return null;
    }
    
    // Leer dimensiones (4 bytes cada una)
    const width = buffer.readUInt32BE(ihdrOffset - 4);
    const height = buffer.readUInt32BE(ihdrOffset);
    
    return { width, height };
  } catch (error) {
    console.log(`❌ Error al analizar ${path.basename(imagePath)}: ${error.message}`);
    return null;
  }
}

// Función para evaluar qué tan bien se adapta una imagen a las dimensiones requeridas
function evaluateFit(actual, required) {
  const widthRatio = actual.width / required.width;
  const heightRatio = actual.height / required.height;
  
  // Si las dimensiones son exactas, es perfecto
  if (actual.width === required.width && actual.height === required.height) {
    return { score: 100, reason: 'Dimensiones exactas' };
  }
  
  // Si es más grande, puede escalarse bien
  if (widthRatio >= 1 && heightRatio >= 1) {
    const score = Math.min(100, 90 - Math.abs(widthRatio - heightRatio) * 10);
    return { score, reason: `Más grande (${actual.width}x${actual.height}), puede escalarse` };
  }
  
  // Si es más pequeño, puede escalarse pero perderá calidad
  if (widthRatio >= 0.5 && heightRatio >= 0.5) {
    const score = Math.min(80, 70 + (widthRatio + heightRatio) * 10);
    return { score, reason: `Más pequeño (${actual.width}x${actual.height}), escalado aceptable` };
  }
  
  // Si es muy pequeño, no es recomendable
  return { score: 30, reason: `Muy pequeño (${actual.width}x${actual.height}), no recomendado` };
}

// Función para analizar todas las imágenes
function analyzeAllImages() {
  const pngDir = path.join(__dirname, '../../PNG');
  const images = fs.readdirSync(pngDir).filter(file => file.endsWith('.png'));
  
  console.log('🔍 Analizando dimensiones de imágenes PNG...\n');
  
  const analysis = [];
  
  for (const image of images) {
    const imagePath = path.join(pngDir, image);
    const dimensions = getImageDimensions(imagePath);
    
    if (dimensions) {
      const stats = fs.statSync(imagePath);
      const sizeInKB = Math.round(stats.size / 1024);
      
      analysis.push({
        name: image,
        dimensions,
        sizeInKB,
        path: imagePath
      });
      
      console.log(`📏 ${image}: ${dimensions.width}x${dimensions.height}px (${sizeInKB} KB)`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RECOMENDACIONES POR TIPO DE USO');
  console.log('='.repeat(60));
  
  // Analizar para cada tipo de uso
  Object.entries(REQUIRED_DIMENSIONS).forEach(([type, required]) => {
    console.log(`\n📱 ${required.name} (${required.width}x${required.height}px):`);
    
    const evaluations = analysis.map(img => ({
      ...img,
      evaluation: evaluateFit(img.dimensions, required)
    }));
    
    // Ordenar por score (mejor primero)
    evaluations.sort((a, b) => b.evaluation.score - a.evaluation.score);
    
    evaluations.forEach((img, index) => {
      const { score, reason } = img.evaluation;
      const emoji = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      console.log(`  ${emoji} ${img.name}: ${score}/100 - ${reason}`);
    });
  });
  
  // Recomendaciones específicas
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMENDACIONES ESPECÍFICAS');
  console.log('='.repeat(60));
  
  // Para icono principal (1024x1024)
  const iconEvals = analysis.map(img => ({
    ...img,
    evaluation: evaluateFit(img.dimensions, REQUIRED_DIMENSIONS.icon)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Icono Principal (1024x1024px):');
  console.log(`   Mejor opción: ${iconEvals[0].name} (${iconEvals[0].evaluation.score}/100)`);
  
  // Para icono adaptativo (1080x1080)
  const adaptiveEvals = analysis.map(img => ({
    ...img,
    evaluation: evaluateFit(img.dimensions, REQUIRED_DIMENSIONS.adaptiveIcon)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Icono Adaptativo (1080x1080px):');
  console.log(`   Mejor opción: ${adaptiveEvals[0].name} (${adaptiveEvals[0].evaluation.score}/100)`);
  
  // Para splash (1242x2436)
  const splashEvals = analysis.map(img => ({
    ...img,
    evaluation: evaluateFit(img.dimensions, REQUIRED_DIMENSIONS.splash)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Splash Screen (1242x2436px):');
  console.log(`   Mejor opción: ${splashEvals[0].name} (${splashEvals[0].evaluation.score}/100)`);
  
  console.log('\n💡 Nota: Las imágenes más grandes pueden escalarse bien, pero las más pequeñas pueden perder calidad.');
}

if (require.main === module) {
  analyzeAllImages();
}

module.exports = { analyzeAllImages, getImageDimensions, evaluateFit }; 