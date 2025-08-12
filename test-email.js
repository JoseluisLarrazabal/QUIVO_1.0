require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmailService() {
  console.log('🧪 Probando servicio de email...');
  console.log('📧 Configuración actual:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- SMTP_HOST:', process.env.SMTP_HOST);
  console.log('- SMTP_PORT:', process.env.SMTP_PORT);
  console.log('- EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
  
  try {
    // Verificar conexión
    console.log('\n🔍 Verificando conexión...');
    const isConnected = await emailService.verifyConnection();
    console.log('✅ Conexión exitosa:', isConnected);
    
    if (isConnected) {
      // Enviar email de prueba
      console.log('\n📤 Enviando email de prueba...');
      await emailService.sendWelcomeEmail('test@example.com', 'Usuario Test');
      console.log('✅ Email de prueba enviado exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de email:', error.message);
    console.log('\n💡 Posibles soluciones:');
    console.log('1. Verificar que las variables de entorno estén configuradas');
    console.log('2. Verificar que el servicio de email (SendGrid) esté activo');
    console.log('3. Verificar que la API key sea válida');
  }
}

testEmailService();
