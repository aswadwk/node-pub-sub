import express from 'express';
import pubSubController from '../controllers/pub-sub-controller.js';

const publicApi = express.Router();

publicApi.get('/', (req, res) => {
    res.send('Hello World!');
});
publicApi.post('/api/v1/publish', pubSubController.publishMessage);

export default publicApi;
