import dotenv from 'dotenv';
import { Connection } from 'rabbitmq-client';
import appService from './app-service.js';
import logger from '../application/logging.js';

dotenv.config();

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const CONNECTION_TIMEOUT = 5000;

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.publisher = null;
        this.consumer = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) return;

            this.connection = new Connection(AMQP_URL, {
                timeout: CONNECTION_TIMEOUT,
                heartbeat: 60,
            });

            // Register connection error handler
            this.connection.on('error', (err) => {
                logger.error('RabbitMQ connection error:', { error: err });
            });

            // Single instance of cleanup handlers
            this.setupCleanupHandlers();

            logger.info('RabbitMQ connection established successfully.');
            // Wait for the connection to be established

            this.isInitialized = true;
        } catch (error) {
            logger.error('Failed to initialize RabbitMQ connection:', { error });
            throw error;
        }
    }

    setupCleanupHandlers() {
        const cleanup = async () => {
            try {
                if (this.publisher) {
                    await this.publisher.close();
                }
                if (this.consumer) {
                    await this.consumer.close();
                }
                if (this.connection) {
                    await this.connection.close();
                }
            } catch (error) {
                logger.error('Error during cleanup:', { error });
            }
        };

        // Register cleanup handlers only once
        process.once('SIGINT', cleanup);
        process.once('SIGTERM', cleanup);
    }

    async publish(message, exchange = 'delayed_exchange', routingKey = 'push-notification', delayInSecond = 5000) {
        try {
            await this.ensureInitialized();

            if (!this.publisher) {
                this.publisher = this.connection.createPublisher({
                    confirm: true,
                    maxAttempts: 2,
                    exchanges: [{
                        exchange,
                        autoDelete: false,
                        type: 'x-delayed-message',
                        durable: true,
                        arguments: {
                            'x-queue-type': 'quorum',
                        },
                    }],
                    arguments: {
                        'x-queue-type': 'quorum',
                    },
                });
            }

            await this.publisher.send(
                {
                    exchange,
                    routingKey,
                    headers: {
                        'x-delay': delayInSecond,
                    },
                },
                message,
            );
        } catch (error) {
            logger.error('Error publishing message:', { error });
            throw error;
        }
    }

    async consume(queue = 'push-notification') {
        try {
            await this.ensureInitialized();

            if (!this.consumer) {
                this.consumer = this.connection.createConsumer({
                    queue,
                    noAck: false,
                    queueOptions: {
                        durable: true,
                        arguments: {
                            'x-queue-type': 'quorum',
                        },
                    },
                    qos: { prefetchCount: 1 },
                    exchanges: [{
                        exchange: 'delayed_exchange',
                        type: 'x-delayed-message',
                        durable: true,
                        autoDelete: false,
                    }],
                }, async (msg) => {
                    await appService.handleJob(msg.body);
                });

                this.consumer.on('error', (err) => {
                    logger.error('Error consuming message:', { error: err });
                });
            }
        } catch (error) {
            logger.error('Error setting up consumer:', { error });
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
}

// Create a single instance
const rabbitMQService = new RabbitMQService();

// Export the instance directly instead of destructuring methods
export default rabbitMQService;
