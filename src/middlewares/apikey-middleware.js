import { verifyApiKey } from '../application/security.js';
import ResponseError from '../commons/response-error.js';

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.get('X-API-KEY');
    if (!apiKey) {
        throw new ResponseError(401, 'Unauthorized');
    }

    verifyApiKey(apiKey);

    next();
};

export default apiKeyMiddleware;
