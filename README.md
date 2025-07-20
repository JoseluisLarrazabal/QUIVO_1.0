# Sistema NFC Transporte Público - Backend

Backend completo para el sistema de tarjetas NFC de transporte público en Bolivia, desarrollado con Node.js, Express y MongoDB Atlas.

## 🚀 Características

- ✅ API REST completa para gestión de tarjetas NFC
- ✅ **NUEVO**: Gestión avanzada de tarjetas (agregar, eliminar, renombrar)
- ✅ **NUEVO**: Sistema de alias para tarjetas personalizadas
- ✅ **NUEVO**: Soporte para múltiples tarjetas por usuario
- ✅ Validación de tarjetas en tiempo real
- ✅ Sistema de recargas con múltiples métodos de pago
- ✅ Historial completo de transacciones
- ✅ Panel administrativo con estadísticas
- ✅ Seguridad con rate limiting y validaciones
- ✅ Base de datos MongoDB Atlas optimizada
- ✅ **NUEVO**: Suite completa de tests unitarios e integración
- ✅ Documentación completa de la API

## 📋 Requisitos

- Node.js 16+ 
- MongoDB Atlas (cuenta gratuita disponible)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd nfc-transport-backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp env.example .env
# Editar .env con tus configuraciones de MongoDB Atlas
```

4. **Configurar MongoDB Atlas:**
   - Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Crear un cluster (gratuito disponible)
   - Obtener la cadena de conexión
   - Configurar la variable `MONGODB_URI` en el archivo `.env`

5. **Ejecutar tests (opcional):**
```bash
npm test
```

6. **Iniciar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🗄️ Estructura de la Base de Datos

### Colecciones Principales

- **users**: Información de los usuarios con autenticación
- **cards**: Tarjetas NFC con saldos y alias personalizados
- **transactions**: Historial de viajes y recargas
- **validators**: Dispositivos instalados en buses

### Tipos de Usuario y Tarifas

| Tipo | Tarifa | Color | Descripción |
|------|--------|-------|-------------|
| Adulto | 2.50 Bs | Azul | Usuarios regulares |
| Estudiante | 1.00 Bs | Verde | Estudiantes con credencial |
| Adulto Mayor | 1.50 Bs | Dorado | Adultos mayores de 65 años |

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar servidor
npm run dev        # Desarrollo con nodemon
npm test           # Ejecutar tests
npm run test:watch # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Login con credenciales
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login-card` - Login con UID de tarjeta

### Tarjetas
- `GET /api/saldo/:uid` - Consultar saldo
- `POST /api/tarjetas` - Crear tarjeta
- `GET /api/tarjetas` - Listar tarjetas
- **NUEVO**: `POST /api/usuario/:userId/tarjetas` - Agregar tarjeta a usuario existente
- **NUEVO**: `DELETE /api/tarjetas/:uid` - Eliminar (desactivar) tarjeta
- **NUEVO**: `PATCH /api/tarjetas/:uid` - Actualizar alias de tarjeta
- `GET /api/usuario/:userId/tarjetas` - Obtener tarjetas de usuario

### Transacciones
- `GET /api/historial/:uid` - Historial
- `POST /api/recargar` - Recargar saldo
- `POST /api/validar` - Validar en bus

### Validadores
- `GET /api/validadores` - Listar validadores
- `POST /api/validadores` - Crear validador
- `PUT /api/validadores/:id/estado` - Actualizar estado

### Administración
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/reportes` - Reportes

## 🧪 Testing

El proyecto incluye una suite completa de tests:

### Tests Unitarios
- **Modelos**: Validaciones, métodos estáticos e instancia
- **Middleware**: Validaciones de entrada
- **Utilidades**: Funciones auxiliares

### Tests de Integración
- **Endpoints**: Todas las rutas de la API
- **Autenticación**: Login, registro y validación
- **Transacciones**: Recargas, validaciones e historial
- **Gestión de tarjetas**: CRUD completo con validaciones

### Cobertura de Tests
```bash
npm run test:coverage
```

**Resultados actuales:**
- ✅ 9 suites de test pasando
- ✅ 146 tests pasando (incluyendo rate limiting)
- ✅ 0 tests fallando
- ✅ Cobertura completa de funcionalidades críticas
- ✅ **NUEVO**: Tests de rate limiting activados y optimizados
- ✅ **NUEVO**: Configuración flexible de rate limiting por entorno

## 🔒 Seguridad

- **Rate limiting configurado por entorno**:
  - Producción: 100 requests/15min (configurable via `RATE_LIMIT_MAX`)
  - Test: 5 requests/15min (configurable via `TEST_RATE_LIMIT_MAX`)
- Validación de datos con middleware personalizado
- Headers de seguridad con Helmet
- Logs detallados de todas las operaciones
- Encriptación de contraseñas con bcrypt
- Validación de tipos de usuario y tarifas

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
- Manejo de errores centralizado

## 🚀 Despliegue

### Docker (Recomendado)
```bash
# Crear imagen
docker build -t nfc-backend .

# Ejecutar con docker-compose
docker-compose up -d
```

### Servidor tradicional
```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start server.js --name nfc-backend
pm2 startup
pm2 save
```

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

## 🆕 Nuevas Funcionalidades

### Gestión Avanzada de Tarjetas
- **Alias personalizados**: Los usuarios pueden asignar nombres a sus tarjetas
- **Múltiples tarjetas**: Soporte para usuarios con varias tarjetas
- **Gestión de estado**: Activación/desactivación de tarjetas
- **Validaciones mejoradas**: Prevención de UIDs duplicados

### Sistema de Autenticación Mejorado
- **Login dual**: Credenciales tradicionales o UID de tarjeta
- **Registro seguro**: Encriptación automática de contraseñas
- **Gestión de sesiones**: Manejo robusto de estados de usuario

### Tests Automatizados
- **Cobertura completa**: Todos los endpoints y modelos testeados
- **Validaciones**: Tests para casos de éxito y error
- **Limpieza automática**: Los tests limpian los datos de prueba

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Ejecutar tests (`npm test`)
4. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crear Pull Request

### Guías de Contribución
- Seguir las convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario
- Verificar que todos los tests pasen antes del PR

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@nfctransporte.bo
- Documentación: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] API para reportes avanzados
- [ ] Sistema de notificaciones push
- [ ] Integración con sistemas de pago externos
- [ ] Dashboard administrativo web
- [ ] API para análisis de datos en tiempo real
