# Sistema NFC Transporte Público - Backend

Backend completo para el sistema de tarjetas NFC de transporte público en Bolivia, desarrollado con Node.js, Express y MongoDB Atlas.

## 🚀 Características

- ✅ API REST completa para gestión de tarjetas NFC
- ✅ Validación de tarjetas en tiempo real
- ✅ Sistema de recargas con múltiples métodos de pago
- ✅ Historial completo de transacciones
- ✅ Panel administrativo con estadísticas
- ✅ Seguridad con rate limiting y validaciones
- ✅ Base de datos MongoDB Atlas optimizada
- ✅ Documentación completa de la API

## 📋 Requisitos

- Node.js 16+ 
- MongoDB Atlas (cuenta gratuita disponible)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio:**
\`\`\`bash
git clone <repository-url>
cd nfc-transport-backend
\`\`\`

2. **Instalar dependencias:**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno:**
\`\`\`bash
cp env.example .env
# Editar .env con tus configuraciones de MongoDB Atlas
\`\`\`

4. **Configurar MongoDB Atlas:**
   - Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Crear un cluster (gratuito disponible)
   - Obtener la cadena de conexión
   - Configurar la variable `MONGODB_URI` en el archivo `.env`

5. **Iniciar el servidor:**
\`\`\`bash
# Desarrollo
npm run dev

# Producción
npm start
\`\`\`

## 🗄️ Estructura de la Base de Datos

### Colecciones Principales

- **users**: Información de los usuarios
- **cards**: Tarjetas NFC y saldos
- **transactions**: Historial de viajes y recargas
- **validators**: Dispositivos instalados en buses

### Tipos de Usuario y Tarifas

| Tipo | Tarifa | Color |
|------|--------|-------|
| Adulto | 2.50 Bs | Azul |
| Estudiante | 1.00 Bs | Verde |
| Adulto Mayor | 1.50 Bs | Dorado |

## 🔧 Scripts Disponibles

\`\`\`bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
npm test           # Ejecutar tests
\`\`\`

## 📡 Endpoints Principales

### Tarjetas
- `GET /api/saldo/:uid` - Consultar saldo
- `POST /api/tarjetas` - Crear tarjeta
- `GET /api/tarjetas` - Listar tarjetas

### Transacciones
- `GET /api/historial/:uid` - Historial
- `POST /api/recargar` - Recargar saldo
- `POST /api/validar` - Validar en bus

### Administración
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/reportes` - Reportes

## 🔒 Seguridad

- Rate limiting (100 requests/15min)
- Validación de datos con Joi
- Headers de seguridad con Helmet
- Logs detallados de todas las operaciones

## 🧪 Datos de Prueba

El sistema incluye datos de prueba que se pueden crear manualmente:

**Tarjetas de prueba:**
- `A1B2C3D4` - Juan Pérez (Adulto) - 25.00 Bs
- `E5F6G7H8` - María García (Estudiante) - 15.50 Bs
- `I9J0K1L2` - Carlos Mamani (Adulto Mayor) - 30.00 Bs

**Validadores:**
- `VAL001` - Línea A - El Alto
- `VAL002` - Línea B - Zona Sur
- `VAL003` - Línea C - Centro

## 📊 Monitoreo

El sistema incluye:
- Health check en `/health`
- Logs estructurados con Morgan
- Métricas de rendimiento
- Estadísticas en tiempo real

## 🚀 Despliegue

### Docker (Recomendado)
\`\`\`bash
# Crear imagen
docker build -t nfc-backend .

# Ejecutar con docker-compose
docker-compose up -d
\`\`\`

### Servidor tradicional
\`\`\`bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start server.js --name nfc-backend
pm2 startup
pm2 save
\`\`\`

## 🔄 Migración de PostgreSQL a MongoDB

Este proyecto fue migrado de PostgreSQL a MongoDB Atlas para:

- **Escalabilidad**: MongoDB Atlas ofrece escalabilidad automática
- **Flexibilidad**: Esquemas flexibles para futuras expansiones
- **Mantenimiento**: Menos configuración de servidor
- **Costos**: Plan gratuito disponible para desarrollo

### Cambios principales:
- Reemplazo de `pg` por `mongoose`
- Conversión de modelos SQL a esquemas Mongoose
- Eliminación de transacciones SQL (MongoDB maneja atomicidad automáticamente)
- Actualización de consultas a agregaciones de MongoDB

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@nfctransporte.bo
- Documentación: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
