// eslint-disable-next-line import/extensions
import web from './application/web.js';
// import rabbit from './services/rebbit-mq-service.js';
import { consume } from './services/rebbit-mq-service.js';

web.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('app runnning at port 3000');

    consume('push-notification');
});
