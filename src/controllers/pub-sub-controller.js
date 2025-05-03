import logger from '../application/logging.js';
import rabbitMQService from '../services/rabbit-mq-service.js';
import { publishMessageValidation } from '../validations/auth-validation.js';
import validate from '../validations/validation.js';

const KEY_SECRETS = process.env.KEY_SECRETS ? process.env.KEY_SECRETS.split(',') : [
    'x-api-key',
    'password',
];

const sanitizeSecrets = (obj, secrets) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };

    for (const key in sanitized) {
        if (secrets.includes(key)) {
            sanitized[key] = '********';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeSecrets(sanitized[key], secrets);
        }
    }

    return sanitized;
};


const publishMessage = async (req, res, next) => {
    try {
        const validatePublishMessage = validate(publishMessageValidation, req.body);

        const sanitizedBody = sanitizeSecrets(req.body, KEY_SECRETS);

        logger.info('Incoming request to publish message:', { body: sanitizedBody });

        await rabbitMQService.publish(validatePublishMessage, 'delayed_exchange', 'push-notification', req.body?.delay);

        res.status(201).json({
            status: true,
            message: 'Message published successfully.',
            data: req.body,
        });
    } catch (error) {
        next(error);
    }
};

export default {
    publishMessage,
};
