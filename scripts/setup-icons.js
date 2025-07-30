const fs = require('fs');
const path = require('path');

// Configuración de iconos
const ICON_CONFIG = {
  // Opciones disponibles en la carpeta PNG
  availableIcons: [
    'ICONO TRUFI MORADO.png',
    'ICONO TRUFI AMARILLO.png', 
    'ICONO TAXITRUFI MORADO.png',
    'ICONO TAXITRUFI AMARILLO.png',
    'ISOTIPO AMARILLO.png',
    'LOGOTIPO AMARILLO.png',
    'IMAGOTIPO AMARILLO.png',
    'IMAGOTIPO MORADO.png'
  ],
  
  // Mapeo de archivos de destino
  targetFiles: {
    icon: 'icon.png',
    adaptiveIcon: 'adaptive-icon.png',
    splashIcon: 'splash-icon.png'
  }
};

// Función para listar iconos disponibles
function listAvailableIcons() {
  const pngDir = path.join(__dirname, '../../PNG');
  console.log('🎨 Iconos disponibles en la carpeta PNG:\n');
  
  ICON_CONFIG.availableIcons.forEach((icon, index) => {
    const iconPath = path.join(pngDir, icon);
    if (fs.existsSync(iconPath)) {
      const stats = fs.statSync(iconPath);
      const sizeInKB = Math.round(stats.size / 1024);
      console.log(`${index + 1}. ${icon} (${sizeInKB} KB)`);
    }
  });
  console.log('');
}

// Función para copiar icono
function copyIcon(sourceIcon, targetName) {
  const sourcePath = path.join(__dirname, '../../PNG', sourceIcon);
  const targetPath = path.join(__dirname, '../assets/images', targetName);
  
  try {
    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ No se encontró: ${sourceIcon}`);
      return false;
    }
    
    // Crear directorio de destino si no existe
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copiar archivo
    fs.copyFileSync(sourcePath, targetPath);
    
    const stats = fs.statSync(targetPath);
    const sizeInKB = Math.round(stats.size / 1024);
    console.log(`✅ Copiado: ${sourceIcon} → ${targetName} (${sizeInKB} KB)`);
    return true;
  } catch (error) {
    console.log(`❌ Error al copiar ${sourceIcon}: ${error.message}`);
    return false;
  }
}

// Función para configurar iconos automáticamente
function setupIconsAutomatically() {
  console.log('🚀 Configurando iconos automáticamente...\n');
  
  // Usar ISOTIPO AMARILLO como icono principal (más simple)
  const mainIcon = 'ISOTIPO AMARILLO.png';
  const adaptiveIcon = 'ICONO TRUFI AMARILLO.png';
  const splashIcon = 'IMAGOTIPO AMARILLO.png';
  
  console.log('📋 Configuración sugerida:');
  console.log(`   • Icono principal: ${mainIcon}`);
  console.log(`   • Icono adaptativo: ${adaptiveIcon}`);
  console.log(`   • Splash screen: ${splashIcon}\n`);
  
  // Copiar iconos
  copyIcon(mainIcon, 'icon.png');
  copyIcon(adaptiveIcon, 'adaptive-icon.png');
  copyIcon(splashIcon, 'splash-icon.png');
  
  console.log('\n✅ Iconos configurados!');
  console.log('💡 Ejecuta "npm run check-icons" para verificar');
  console.log('💡 Ejecuta "expo start" para probar la app');
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    listAvailableIcons();
    return;
  }
  
  if (args.includes('--auto') || args.includes('-a')) {
    setupIconsAutomatically();
    return;
  }
  
  // Mostrar ayuda
  console.log('🎨 Configurador de Iconos - QUIVO\n');
  console.log('Comandos disponibles:');
  console.log('  npm run setup-icons --list    - Listar iconos disponibles');
  console.log('  npm run setup-icons --auto    - Configurar automáticamente');
  console.log('');
  console.log('💡 Recomendación: Ejecuta "npm run setup-icons --auto" para configurar automáticamente');
}

if (require.main === module) {
  main();
}

module.exports = { listAvailableIcons, copyIcon, setupIconsAutomatically }; 