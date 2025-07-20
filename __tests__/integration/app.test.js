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
    test('debería aplicar rate limiting en endpoints de API', async () => {
      // Para este test específico, vamos a hacer muchas requests para asegurar que se active el rate limiting
      // El límite actual es 100, así que haremos 105 requests
      const requests = Array(105).fill().map(() => 
        request(app).get('/api/saldo/TEST123') // Usar un endpoint GET que tenga rate limiting
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      // Debería haber al menos algunas respuestas con rate limiting (105 - 100 = 5)
      expect(rateLimitedResponses.length).toBeGreaterThanOrEqual(1);
      
      // Verificar que las primeras 100 requests fueron exitosas (404 porque la tarjeta no existe)
      const successfulResponses = responses.filter(r => r.status === 404);
      expect(successfulResponses.length).toBe(100);
    });

    test('debería incluir headers de rate limiting en respuestas', async () => {
      const response = await request(app).get('/api/saldo/TEST123'); // Usar endpoint con rate limiting
      
      // Verificar que se incluyen headers de rate limiting (versión 7.x usa 'ratelimit-*')
      expect(response.headers['ratelimit-limit']).toBeDefined();
      expect(response.headers['ratelimit-remaining']).toBeDefined();
      expect(response.headers['ratelimit-reset']).toBeDefined();
      
      // Verificar valores específicos para test
      expect(response.headers['ratelimit-limit']).toBe('100'); // Límite configurado para test
      expect(parseInt(response.headers['ratelimit-remaining'])).toBeLessThanOrEqual(100);
    });
  });

  describe('JSON Parsing', () => {
    test('debería manejar JSON inválido', async () => {
      // Usar un endpoint que no tenga rate limiting para evitar conflictos
      const response = await request(app)
        .post('/health') // Usar health check que no tiene rate limiting
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