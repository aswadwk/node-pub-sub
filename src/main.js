import web from './application/web.js';
import rabbitMQService from './services/rebbit-mq-service.js';

const port = process.env.PORT;

web.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`app runnning at port ${port}`);

    rabbitMQService.consume('push-notification');
});
