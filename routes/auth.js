const express = require("express")
const router = express.Router()
const authService = require("../services/authService")
const { authenticateToken } = require("../middleware/auth")

// Login con usuario y contraseña
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Usuario y contraseña son requeridos",
        code: "MISSING_CREDENTIALS"
      });
    }

    const result = await authService.authenticateUser(username, password);
    
    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(401).json({ 
      success: false, 
      error: error.message,
      code: "AUTHENTICATION_FAILED"
    });
  }
});

// Login con UID de tarjeta
router.post("/login-card", async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        error: "UID de tarjeta es requerido",
        code: "MISSING_CARD_UID"
      });
    }
    
    const result = await authService.authenticateWithCard(uid);
    
    res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("Error en login por tarjeta:", error);
    res.status(401).json({ 
      success: false, 
      error: error.message,
      code: "CARD_AUTHENTICATION_FAILED"
    });
  }
});

// Registro de nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { username, password, nombre, tipo_tarjeta, telefono, email } = req.body;
    
    if (!username || !password || !nombre || !tipo_tarjeta) {
      return res.status(400).json({ 
        success: false, 
        error: "Todos los campos obligatorios son requeridos",
        code: "MISSING_REQUIRED_FIELDS"
      });
    }
    
    const result = await authService.registerUser({
      username, password, nombre, tipo_tarjeta, telefono, email
    });
    
    res.status(201).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(400).json({ 
      success: false, 
      error: error.message,
      code: "REGISTRATION_FAILED"
    });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        error: "Refresh token es requerido",
        code: "MISSING_REFRESH_TOKEN"
      });
    }
    
    const tokens = await authService.refreshAccessToken(refreshToken);
    
    res.status(200).json({ 
      success: true, 
      data: tokens 
    });
  } catch (error) {
    console.error("Error al refrescar token:", error);
    res.status(401).json({ 
      success: false, 
      error: error.message,
      code: "REFRESH_TOKEN_FAILED"
    });
  }
});

// Logout (revocar tokens)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    await authService.revokeTokens(req.user.id);
    
    res.status(200).json({ 
      success: true, 
      message: "Sesión cerrada exitosamente" 
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ 
      success: false, 
      error: "Error al cerrar sesión",
      code: "LOGOUT_FAILED"
    });
  }
});

// Verificar token (endpoint de prueba)
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      data: { 
        user: req.user,
        message: "Token válido" 
      } 
    });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(401).json({ 
      success: false, 
      error: "Token inválido",
      code: "TOKEN_INVALID"
    });
  }
});

module.exports = router
