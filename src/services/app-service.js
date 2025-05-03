import logger from '../application/logging.js';

const handleJob = async (msg) => {
    const {
        url, method, headers, body,
    } = msg;

    try {
        logger.info('handleJob', {
            url, method, headers, body,
        });

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });

        return true;
    } catch (error) {
        logger.error('Error handling job:', { error });
        return false;
    }
};

export default { handleJob };
