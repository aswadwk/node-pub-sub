import express from 'express';
import authController from '../controllers/auth-controller.js';
import pubSubController from '../controllers/pub-sub-controller.js';

const publicApi = express.Router();

publicApi.post('/api/v1/register', authController.register);
publicApi.post('/api/v1/login', authController.login);
publicApi.get('/', (req, res) => {
    res.send('Hello World!');
});
publicApi.post('/api/v1/publish', pubSubController.publishMessage);

export default publicApi;
