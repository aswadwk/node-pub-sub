import { Connection } from 'rabbitmq-client';

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const CONNECTION_TIMEOUT = 5000;

const rabbit = new Connection(AMQP_URL, {
    timeout: CONNECTION_TIMEOUT,
    heartbeat: 60,
});

export default rabbit;

// publish a message
const publish = async (message, exchange = 'delayed_exchange', routingKey = 'push-notification', delayInSecond = 5000) => {
    // See API docs for all options
    const pub = rabbit.createPublisher({
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
    const consumer = rabbit.createConsumer({
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
        console.log('received message (delayed_exchange)', msg);
        console.log('received message (delayed_exchange)', msg.body);
        // The message is automatically acknowledged (BasicAck) when this function ends.
        // If this function throws an error, then msg is rejected (BasicNack) and
        // possibly requeued or sent to a dead-letter exchange. You can also return a
        // status code from this callback to control the ack/n
        // Explicitly acknowledge the message
        // await msg.
    });

    consumer.on('error', (err) => {
        console.error('error consuming message', err);
    });
};

export { publish, consume };
