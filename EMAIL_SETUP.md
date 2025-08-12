# Configuración del Servicio de Email - QUIVO Backend

## 📧 Configuración del Servicio de Email

Este documento explica cómo configurar el servicio de email para las funcionalidades de recuperación de contraseña y verificación de email.

## 🔧 Variables de Entorno Requeridas

### Para Desarrollo (Gmail SMTP)

```env
# Configuración de Email para Desarrollo
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=noreply@quivo.com
FRONTEND_URL=http://localhost:3000
```

### Para Producción (Servicio de Email)

```env
# Configuración de Email para Producción
SMTP_HOST=smtp.tuservicio.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-usuario
SMTP_PASS=tu-contraseña
EMAIL_FROM=noreply@quivo.com
FRONTEND_URL=https://tu-app.com
```

## 📋 Configuración de Gmail para Desarrollo

### 1. Habilitar Autenticación de 2 Factores
1. Ve a tu cuenta de Google
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicación"
4. Genera una nueva contraseña para la aplicación

### 2. Configurar Variables de Entorno
```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=la-contraseña-de-aplicacion-generada
```

## 🚀 Servicios de Email Recomendados para Producción

### 1. SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=tu-api-key-de-sendgrid
```

### 2. Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-usuario
SMTP_PASS=tu-contraseña
```

### 3. Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-access-key
SMTP_PASS=tu-secret-key
```

## 📧 Tipos de Email Implementados

### 1. Email de Recuperación de Contraseña
- **Trigger**: Usuario solicita recuperación de contraseña
- **Contenido**: Enlace seguro para resetear contraseña
- **Expiración**: 10 minutos
- **Template**: Incluye branding de QUIVO

### 2. Email de Verificación de Email
- **Trigger**: Usuario se registra
- **Contenido**: Enlace para verificar email
- **Expiración**: 24 horas
- **Template**: Incluye branding de QUIVO

### 3. Email de Bienvenida
- **Trigger**: Usuario se registra exitosamente
- **Contenido**: Información de bienvenida y próximos pasos
- **Template**: Incluye branding de QUIVO

## 🔒 Seguridad

### Tokens de Seguridad
- **Reset Password Token**: Generado con crypto.randomBytes(32)
- **Verification Token**: Generado con crypto.randomBytes(32)
- **Hashing**: Tokens se almacenan hasheados con SHA-256
- **Expiración**: Tokens tienen tiempo de expiración configurable

### Validaciones
- Validación de formato de email
- Verificación de existencia de usuario
- Protección contra ataques de timing
- Logging de todas las operaciones

## 🧪 Testing

### Verificar Configuración
```javascript
const emailService = require('./services/emailService');

// Verificar conexión
const isConnected = await emailService.verifyConnection();
console.log('Email service connected:', isConnected);
```

### Enviar Email de Prueba
```javascript
// Enviar email de prueba
await emailService.sendWelcomeEmail('test@example.com', 'Usuario Test');
```

## 📊 Monitoreo

### Métricas Registradas
- `password_reset_request`: Solicitudes de recuperación
- `password_reset`: Resets exitosos
- `email_verification`: Verificaciones de email
- `email_verification_resend`: Reenvíos de verificación

### Logs
- Todos los envíos de email se registran
- Errores de envío se registran con detalles
- Intentos fallidos se registran para análisis

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Autenticación Gmail
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solución**: Verificar que la contraseña de aplicación sea correcta

#### 2. Error de Conexión SMTP
```
Error: connect ECONNREFUSED
```
**Solución**: Verificar host y puerto SMTP

#### 3. Email No Llega
- Verificar carpeta de spam
- Verificar configuración de DNS
- Verificar límites del proveedor de email

### Debug Mode
```env
NODE_ENV=development
DEBUG_EMAIL=true
```

## 📝 Notas de Implementación

### Compatibilidad
- El servicio funciona sin email configurado (modo fallback)
- Los usuarios pueden registrarse sin verificación de email
- Los emails fallidos no impiden el funcionamiento de la app

### Escalabilidad
- El servicio está preparado para múltiples proveedores
- Configuración dinámica por entorno
- Rate limiting implementado en las rutas

### Mantenimiento
- Tokens expirados se limpian automáticamente
- Logs rotativos configurados
- Métricas disponibles para monitoreo
