import dotenv from 'dotenv';
import { Connection } from 'rabbitmq-client';
import appService from './app-service.js';

dotenv.config();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const CONNECTION_TIMEOUT = 5000;

const rabbit = new Connection(AMQP_URL, {
    timeout: CONNECTION_TIMEOUT,
    heartbeat: 60,
});

export default rabbit;

let pub = null;
let consumer = null;

// publish a message
const publish = async (message, exchange = 'delayed_exchange', routingKey = 'push-notification', delayInSecond = 5000) => {
    // See API docs for all options
    pub = rabbit.createPublisher({
        // Enable publish confirmations, similar to consumer acknowledgements
        confirm: true,
        // Enable retries
        maxAttempts: 2,
        // Optionally ensure the existence of an exchange before we use it
        exchanges: [{
            exchange,
            autoDelete: false,
            type: 'x-delayed-message',
            durable: true, // Add durable flag
            arguments: {
                'x-queue-type': 'quorum',
            },
        }],
        // Optionally ensure the existence of a queue before we use it
        arguments: {
            'x-queue-type': 'quorum', // Specify quorum queue type
        },
    });

    // Publish a message to a custom exchange
    await pub.send(
        {
            exchange,
            routingKey,
            headers: {
                'x-delay': delayInSecond,
            },
        }, // metadata
        message, // message content
    ); // message content
};

const consume = async (queue = 'push-notification') => {
    // Create a consumer
    consumer = rabbit.createConsumer({
        queue,
        noAck: false,
        queueOptions: {
            durable: true,
            // autoDelete: true,
            arguments: {
                'x-queue-type': 'quorum', // Specify quorum queue type
            },
        },
        // handle 2 messages at a time
        qos: { prefetchCount: 1 },
        // Optionally ensure an exchange exists
        exchanges: [{
            exchange: 'delayed_exchange',
            type: 'x-delayed-message',
            durable: true,
            autoDelete: false,
            // autoDelete: true,
        }],
    }, async (msg) => {
        await appService.handleJob(msg.body);
    });

    consumer.on('error', (err) => {
        console.error('error consuming message', err);
    });
};

// Tambahkan listener hanya sekali
process.on('SIGINT', async () => {
    if (pub) await pub.close();
    if (consumer) await consumer.close();
    await rabbit.close();
});

process.on('SIGTERM', async () => {
    if (pub) await pub.close();
    if (consumer) await consumer.close();
    await rabbit.close();
});

export { publish, consume };
