require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 443; // HTTPS использует порт 443

// Путь к сертификатам
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem'),
};

const logger = require('./logger');

// Middleware для обработки JSON
app.use(express.json());

// Обработка запросов к OpenAI API
app.post('/api', async (req, res) => {
    try {
        const { endpoint, options } = req.body;

        if (!endpoint || !options) {
            logger.warn('Bad request: missing endpoint or options');
            return res.status(400).json({ error: 'Missing endpoint or options in request body' });
        }

        logger.info(`Forwarding request to OpenAI API: endpoint=${endpoint}`);
        const response = await axios.post(
            `https://api.openai.com/v1/${endpoint}`,
            options,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        logger.info(`OpenAI API response: status=${response.status}`);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(error.message);
        logger.error(`Error from OpenAI API: ${error.message}`);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Internal Server Error',
        });
    }
});

// Запуск HTTPS сервера
https.createServer(options, app).listen(port, () => {
    console.log(`Relay server is running securely on https://yourdomain.com`);
});
