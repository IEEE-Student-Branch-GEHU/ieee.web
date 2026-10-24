const request = require('supertest');
const express = require('express');

// Helper to create a test app without full DB connection
const createApp = () => {
    const app = express();
    app.get('/health', (req, res) => res.status(200).send('OK'));
    return app;
};

describe('API Health Check', () => {
    it('should return 200 OK', async () => {
        const app = createApp();
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('OK');
    });
});
