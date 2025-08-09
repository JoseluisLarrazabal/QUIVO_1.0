const fs = require('fs');
const path = require('path');

// Dimensiones reales de las imágenes (obtenidas con 'file' command)
const IMAGE_DIMENSIONS = {
  'ICONO TAXITRUFI AMARILLO.png': { width: 4112, height: 1816 },
  'ICONO TAXITRUFI MORADO.png': { width: 4196, height: 1852 },
  'ICONO TRUFI AMARILLO.png': { width: 4212, height: 1698 },
  'ICONO TRUFI MORADO.png': { width: 4202, height: 1694 },
  'IMAGOTIPO AMARILLO.png': { width: 4238, height: 2914 },
  'IMAGOTIPO CON SLOGAN MORADO.png': { width: 3320, height: 2622 },
  'IMAGOTIPO MORADO.png': { width: 3320, height: 2284 },
  'ISOLOGO AMARILLO.png': { width: 3806, height: 2618 },
  'ISOTIPO AMARILLO.png': { width: 4048, height: 1654 },
  'LOGOTIPO AMARILLO.png': { width: 4076, height: 1624 },
  'LOGOTIPO MORADO.png': { width: 3750, height: 1494 }
};

// Dimensiones requeridas
const REQUIRED_DIMENSIONS = {
  icon: { width: 1024, height: 1024, name: 'Icono Principal' },
  adaptiveIcon: { width: 1080, height: 1080, name: 'Icono Adaptativo' },
  splash: { width: 1242, height: 2436, name: 'Splash Screen' }
};

// Función para evaluar qué tan bien se adapta una imagen
function evaluateFit(actual, required) {
  const widthRatio = actual.width / required.width;
  const heightRatio = actual.height / required.height;
  
  // Calcular proporción de aspecto
  const actualRatio = actual.width / actual.height;
  const requiredRatio = required.width / required.height;
  const ratioDifference = Math.abs(actualRatio - requiredRatio);
  
  // Si las dimensiones son exactas, es perfecto
  if (actual.width === required.width && actual.height === required.height) {
    return { score: 100, reason: 'Dimensiones exactas' };
  }
  
  // Si es más grande y tiene proporción similar, puede escalarse bien
  if (widthRatio >= 1 && heightRatio >= 1 && ratioDifference < 0.5) {
    const score = Math.min(95, 90 - ratioDifference * 10);
    return { score, reason: `Más grande (${actual.width}x${actual.height}), proporción similar, escalado excelente` };
  }
  
  // Si es más grande pero proporción diferente
  if (widthRatio >= 1 && heightRatio >= 1) {
    const score = Math.min(85, 80 - ratioDifference * 5);
    return { score, reason: `Más grande (${actual.width}x${actual.height}), proporción diferente, escalado bueno` };
  }
  
  // Si es más pequeño pero proporción similar
  if (widthRatio >= 0.5 && heightRatio >= 0.5 && ratioDifference < 0.5) {
    const score = Math.min(75, 70 + (widthRatio + heightRatio) * 5);
    return { score, reason: `Más pequeño (${actual.width}x${actual.height}), proporción similar, escalado aceptable` };
  }
  
  // Si es más pequeño
  if (widthRatio >= 0.5 && heightRatio >= 0.5) {
    const score = Math.min(65, 60 + (widthRatio + heightRatio) * 5);
    return { score, reason: `Más pequeño (${actual.width}x${actual.height}), escalado limitado` };
  }
  
  // Si es muy pequeño
  return { score: 30, reason: `Muy pequeño (${actual.width}x${actual.height}), no recomendado` };
}

// Función para analizar todas las imágenes
function analyzeImages() {
  console.log('🔍 Analizando imágenes PNG con dimensiones reales...\n');
  
  // Mostrar dimensiones de todas las imágenes
  Object.entries(IMAGE_DIMENSIONS).forEach(([name, dims]) => {
    const ratio = (dims.width / dims.height).toFixed(2);
    console.log(`📏 ${name}: ${dims.width}x${dims.height}px (ratio: ${ratio}:1)`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 RECOMENDACIONES POR TIPO DE USO');
  console.log('='.repeat(70));
  
  // Analizar para cada tipo de uso
  Object.entries(REQUIRED_DIMENSIONS).forEach(([type, required]) => {
    console.log(`\n📱 ${required.name} (${required.width}x${required.height}px, ratio: ${(required.width/required.height).toFixed(2)}:1):`);
    
    const evaluations = Object.entries(IMAGE_DIMENSIONS).map(([name, dims]) => ({
      name,
      dimensions: dims,
      evaluation: evaluateFit(dims, required)
    }));
    
    // Ordenar por score (mejor primero)
    evaluations.sort((a, b) => b.evaluation.score - a.evaluation.score);
    
    evaluations.forEach((img, index) => {
      const { score, reason } = img.evaluation;
      const emoji = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
      const ratio = (img.dimensions.width / img.dimensions.height).toFixed(2);
      console.log(`  ${emoji} ${img.name}: ${score}/100 - ${reason} (ratio: ${ratio}:1)`);
    });
  });
  
  // Recomendaciones específicas
  console.log('\n' + '='.repeat(70));
  console.log('💡 RECOMENDACIONES ESPECÍFICAS');
  console.log('='.repeat(70));
  
  // Para icono principal (1024x1024 - cuadrado)
  const iconEvals = Object.entries(IMAGE_DIMENSIONS).map(([name, dims]) => ({
    name,
    dimensions: dims,
    evaluation: evaluateFit(dims, REQUIRED_DIMENSIONS.icon)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Icono Principal (1024x1024px - cuadrado):');
  console.log(`   Mejor opción: ${iconEvals[0].name} (${iconEvals[0].evaluation.score}/100)`);
  console.log(`   Segunda opción: ${iconEvals[1].name} (${iconEvals[1].evaluation.score}/100)`);
  
  // Para icono adaptativo (1080x1080 - cuadrado)
  const adaptiveEvals = Object.entries(IMAGE_DIMENSIONS).map(([name, dims]) => ({
    name,
    dimensions: dims,
    evaluation: evaluateFit(dims, REQUIRED_DIMENSIONS.adaptiveIcon)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Icono Adaptativo (1080x1080px - cuadrado):');
  console.log(`   Mejor opción: ${adaptiveEvals[0].name} (${adaptiveEvals[0].evaluation.score}/100)`);
  console.log(`   Segunda opción: ${adaptiveEvals[1].name} (${adaptiveEvals[1].evaluation.score}/100)`);
  
  // Para splash (1242x2436 - vertical)
  const splashEvals = Object.entries(IMAGE_DIMENSIONS).map(([name, dims]) => ({
    name,
    dimensions: dims,
    evaluation: evaluateFit(dims, REQUIRED_DIMENSIONS.splash)
  })).sort((a, b) => b.evaluation.score - a.evaluation.score);
  
  console.log('\n🎯 Splash Screen (1242x2436px - vertical):');
  console.log(`   Mejor opción: ${splashEvals[0].name} (${splashEvals[0].evaluation.score}/100)`);
  console.log(`   Segunda opción: ${splashEvals[1].name} (${splashEvals[1].evaluation.score}/100)`);
  
  // Recomendaciones por diseño
  console.log('\n' + '='.repeat(70));
  console.log('🎨 RECOMENDACIONES POR DISEÑO');
  console.log('='.repeat(70));
  
  console.log('\n🎯 Para Iconos (cuadrados):');
  console.log('   • Los ISOTIPO son más simples y funcionan mejor como iconos');
  console.log('   • Los ICONO TRUFI son más detallados pero pueden escalarse bien');
  console.log('   • Evitar LOGOTIPO para iconos (muy anchos)');
  
  console.log('\n🎯 Para Splash Screen (vertical):');
  console.log('   • Los IMAGOTIPO son ideales (diseño completo)');
  console.log('   • Los ISOLOGO también funcionan bien');
  console.log('   • Evitar iconos simples para splash');
  
  console.log('\n🎯 Por Colores:');
  console.log('   • AMARILLO: Más vibrante, mejor visibilidad');
  console.log('   • MORADO: Más corporativo, elegante');
  
  console.log('\n💡 Nota: Todas las imágenes son más grandes que las requeridas, por lo que se escalarán bien.');
}

if (require.main === module) {
  analyzeImages();
}

module.exports = { analyzeImages, IMAGE_DIMENSIONS, evaluateFit }; 