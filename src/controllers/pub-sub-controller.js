import { publish } from '../services/rebbit-mq-service.js';
import { publishMessageValidation } from '../validations/auth-validation.js';
import validate from '../validations/validation.js';

const publishMessage = async (req, res, next) => {
    try {
        const validatePublishMessage = validate(publishMessageValidation, req.body);

        await publish(validatePublishMessage, 'delayed_exchange', 'push-notification', req.body?.delay);

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
