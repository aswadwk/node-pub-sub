import { publish } from '../services/rebbit-mq-service.js';

const publishMessage = async (req, res, next) => {
    try {
        await publish(req.body, 'delayed_exchange', 'push-notification', req.body?.delay);

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
