#!/bin/bash

# Script para generar APK standalone de QUIVO
# Conecta directamente al backend en Render.com

echo "🚀 Iniciando build de APK standalone para QUIVO..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio Frontend/"
    exit 1
fi

# Verificar que EAS CLI esté instalado
if ! command -v eas &> /dev/null; then
    echo "❌ Error: EAS CLI no está instalado"
    echo "Instala con: npm install -g @expo/eas-cli"
    exit 1
fi

# Verificar que esté logueado en Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Error: No estás logueado en Expo"
    echo "Ejecuta: eas login"
    exit 1
fi

echo "✅ Verificaciones completadas"

# Preguntar qué tipo de build quiere el usuario
echo ""
echo "Selecciona el tipo de build:"
echo "1) APK Standalone (Recomendado para distribución)"
echo "2) APK de Producción Standalone"
echo "3) APK con Expo Go (Desarrollo)"
echo ""

read -p "Ingresa el número de opción (1-3): " choice

case $choice in
    1)
        echo "🔨 Generando APK Standalone..."
        eas build --platform android --profile apk-standalone
        ;;
    2)
        echo "🔨 Generando APK de Producción Standalone..."
        eas build --platform android --profile production-standalone
        ;;
    3)
        echo "🔨 Generando APK con Expo Go..."
        eas build --platform android --profile apk
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Build iniciado exitosamente!"
echo "📱 El APK se generará en EAS Build y podrás descargarlo"
echo "🌐 Revisa el progreso en: https://expo.dev/accounts/[tu-usuario]/projects/quivo/builds"
echo ""
echo "📋 Notas importantes:"
echo "- El APK standalone no requiere Expo Go"
echo "- Se conectará automáticamente a https://quivo-backend-3vhv.onrender.com"
echo "- El tamaño será mayor que la versión con Expo Go"
echo "- La primera carga puede ser más lenta" 