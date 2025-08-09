# Guía de Optimización de Iconos - QUIVO

## Problema Actual
Los iconos de la aplicación pueden tener dimensiones incorrectas, causando que no se vean completos en el menú de aplicaciones del celular.

## Dimensiones Correctas

### 1. Icono Principal (`icon.png`)
- **Dimensiones**: 1024x1024 píxeles
- **Formato**: PNG con transparencia
- **Uso**: Icono principal en todas las plataformas
- **Ubicación**: `Frontend/assets/images/icon.png`

### 2. Icono Adaptativo Android (`adaptive-icon.png`)
- **Dimensiones**: 1024x1024 píxeles
- **Formato**: PNG con transparencia
- **Área de contenido**: Máximo 70% del área total
- **Importante**: Deja espacio alrededor para que Android pueda recortar
- **Ubicación**: `Frontend/assets/images/adaptive-icon.png`

### 3. Icono de Splash (`splash-icon.png`)
- **Dimensiones**: 2048x2048 píxeles
- **Formato**: PNG
- **Uso**: Pantalla de carga inicial
- **Ubicación**: `Frontend/assets/images/splash-icon.png`

## Pasos para Optimizar

### Paso 1: Preparar las imágenes
1. Abre tu editor de imágenes (Figma, Photoshop, GIMP, etc.)
2. Crea un canvas de 1024x1024 píxeles para iconos
3. Crea un canvas de 2048x2048 píxeles para splash

### Paso 2: Diseñar los iconos
1. **Para icono principal**: Centra tu logo/diseño en el canvas
2. **Para icono adaptativo**: 
   - Centra el contenido en el 70% central del canvas
   - Deja espacio alrededor para que Android pueda recortar
3. **Para splash**: Usa el diseño completo del canvas

### Paso 3: Exportar
1. Exporta en formato PNG
2. Asegúrate de que el fondo sea transparente (para iconos)
3. Optimiza el tamaño del archivo (debería ser < 100KB)

### Paso 4: Reemplazar archivos
1. Reemplaza los archivos en `Frontend/assets/images/`
2. Ejecuta `npm run check-icons` para verificar
3. Prueba la app con `expo start`

## Comandos Útiles

```bash
# Verificar estado actual de iconos
npm run check-icons

# Iniciar la app para probar
expo start

# Construir para Android
expo build:android
```

## Consejos Importantes

1. **Mantén el diseño simple**: Los iconos pequeños necesitan ser legibles
2. **Usa colores contrastantes**: Para que se vea bien en diferentes fondos
3. **Prueba en diferentes tamaños**: Asegúrate de que se vea bien en 48x48px
4. **Sigue las guías de diseño**: 
   - iOS: https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/
   - Android: https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive

## Verificación

Después de optimizar, ejecuta:
```bash
npm run check-icons
```

Los tamaños de archivo deberían ser:
- `icon.png`: ~50-100 KB
- `adaptive-icon.png`: ~50-100 KB  
- `splash-icon.png`: ~100-200 KB 