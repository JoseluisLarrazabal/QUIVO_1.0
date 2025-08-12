const nodemailer = require('nodemailer');

/**
 * Servicio de Email
 * Patrón: Service Layer
 * Responsabilidades: Envío de emails de recuperación y verificación
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializar el transportador de email
   */
  initializeTransporter() {
    // Configuración para desarrollo (usando Gmail SMTP)
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'quivo.app@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      });
    } else {
      // Configuración para producción (usando servicio de email)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   * @param {String} email - Email del usuario
   * @param {String} resetToken - Token de reset
   * @param {String} userName - Nombre del usuario
   * @returns {Promise<Boolean>} True si se envió exitosamente
   */
  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"QUIVO" <${process.env.EMAIL_FROM || 'noreply@quivo.com'}>`,
        to: email,
        subject: 'Recupera tu contraseña - QUIVO',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">QUIVO</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Transporte Público Bolivia</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hola ${userName},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Recibimos una solicitud para restablecer tu contraseña en QUIVO. 
                Si no realizaste esta solicitud, puedes ignorar este email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                O copia y pega este enlace en tu navegador:
              </p>
              
              <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
                ${resetUrl}
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en 10 minutos por seguridad.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Saludos,<br>
                El equipo de QUIVO
              </p>
            </div>
            
            <div style="background: #343a40; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                © 2024 QUIVO. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de recuperación enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      throw new Error('No se pudo enviar el email de recuperación');
    }
  }

  /**
   * Enviar email de verificación
   * @param {String} email - Email del usuario
   * @param {String} verificationToken - Token de verificación
   * @param {String} userName - Nombre del usuario
   * @returns {Promise<Boolean>} True si se envió exitosamente
   */
  async sendVerificationEmail(email, verificationToken, userName) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: `"QUIVO" <${process.env.EMAIL_FROM || 'noreply@quivo.com'}>`,
        to: email,
        subject: 'Verifica tu email - QUIVO',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">QUIVO</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Transporte Público Bolivia</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido a QUIVO, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Gracias por registrarte en QUIVO. Para completar tu registro, 
                necesitamos verificar tu dirección de email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Verificar Email
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                O copia y pega este enlace en tu navegador:
              </p>
              
              <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; color: #495057;">
                ${verificationUrl}
              </p>
              
              <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #0c5460; margin: 0; font-size: 14px;">
                  <strong>💡 Consejo:</strong> Una vez verificado tu email, podrás acceder a todas las funciones de QUIVO.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Si no creaste esta cuenta, puedes ignorar este email.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Saludos,<br>
                El equipo de QUIVO
              </p>
            </div>
            
            <div style="background: #343a40; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                © 2024 QUIVO. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de verificación enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      throw new Error('No se pudo enviar el email de verificación');
    }
  }

  /**
   * Enviar email de bienvenida
   * @param {String} email - Email del usuario
   * @param {String} userName - Nombre del usuario
   * @returns {Promise<Boolean>} True si se envió exitosamente
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: `"QUIVO" <${process.env.EMAIL_FROM || 'noreply@quivo.com'}>`,
        to: email,
        subject: '¡Bienvenido a QUIVO!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">QUIVO</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Transporte Público Bolivia</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">¡Bienvenido a QUIVO, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar QUIVO 
                para gestionar tus tarjetas de transporte público.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #155724; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
                <ul style="color: #155724; padding-left: 20px;">
                  <li>Agregar tus tarjetas NFC</li>
                  <li>Recargar saldo</li>
                  <li>Ver historial de transacciones</li>
                  <li>Gestionar múltiples tarjetas</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                ¡Disfruta usando QUIVO!<br>
                El equipo de QUIVO
              </p>
            </div>
            
            <div style="background: #343a40; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                © 2024 QUIVO. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenida enviado:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email de bienvenida:', error);
      throw new Error('No se pudo enviar el email de bienvenida');
    }
  }

  /**
   * Verificar conexión del transportador
   * @returns {Promise<Boolean>} True si la conexión es exitosa
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión de email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
