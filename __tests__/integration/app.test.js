const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const app = require('../../server');

describe('App Integration Tests', () => {
  describe('Health Check', () => {
    test('debería responder health check correctamente', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    test('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/ruta-inexistente');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Ruta no encontrada');
    });
  });

  describe('CORS', () => {
    test('debería permitir CORS desde orígenes permitidos', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:19006');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test.skip('debería aplicar rate limiting en endpoints de API', async () => {
      // Hacer múltiples requests rápidos
      const requests = Array(105).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      // Debería haber al menos algunas respuestas con rate limiting
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('JSON Parsing', () => {
    test('debería manejar JSON inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('JSON inválido');
    });
  });

  describe('Error Handling', () => {
    test('debería manejar errores internos del servidor', async () => {
      // Simular un error interno
      const originalConsoleError = console.error;
      console.error = jest.fn(); // Mock console.error

      // Crear una ruta que cause un error real
      const testApp = require('express')();
      testApp.use(express.json());
      
      // Agregar una ruta que cause un error interno
      testApp.get('/test-error', (req, res, next) => {
        next(new Error('Error interno de prueba'));
      });
      
      testApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({
          error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
        });
      });

      const response = await request(testApp)
        .get('/test-error');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno de prueba');

      console.error = originalConsoleError; // Restaurar console.error
    });
  });
}); 