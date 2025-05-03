Node js Pub/Sub with RabbitMQ

## Description

This is a simple example of a publisher/subscriber system using RabbitMQ and Node.js. The publisher sends a message to the exchange and the subscriber receives it.

## Installation

Setup the environment variables in the .env file

```bash
cp .env.example .env
```

example:

```bash
RABBITMQ_DEFAULT_USER=aswad
RABBITMQ_DEFAULT_PASS=aswad
```

Setup definitions json file in the rabbitmq folder, this file is used to create the exchanges, queues, and bindings.

Make sure user and password are the same as in the .env file

```bash
cp rabbitmq/definitions.json.example rabbitmq/definitions.json
```

```bash
docker compose up -d
```
