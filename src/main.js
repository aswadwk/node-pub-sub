import dotenv from 'dotenv';
import web from './application/web.js';
import { consume } from './services/rebbit-mq-service.js';

dotenv.config();
const port = process.env.PORT;

web.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`app runnning at port ${port}`);

    consume('push-notification');
});
