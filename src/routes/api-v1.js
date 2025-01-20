import express from 'express';
import authenticatedMiddleware from '../middlewares/authenticated-middleware.js';

const apiV1 = express.Router();

apiV1.use(authenticatedMiddleware);

export default apiV1;
