# NestJS Producer / Consumer with RabbitMQ

## Run with Docker (recommended)

### Configure environment variables:

Create a .env file in the project root (use .env.example as template):

```
cp .env.example .env
```

Edit .env and add your Telegram bot credentials:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Start all services:

```
docker-compose up --build
```

### Verify services are running:

- Producer API: http://localhost:8080
- Swagger docs: http://localhost:8080/api-docs
- Consumer (no direct endpoint, listens to RabbitMQ)
- RabbitMQ management UI: http://localhost:15672 (guest/guest)

## Manual Setup (Local Development)

### Producer

Ensure RabbitMQ is running locally on amqp://localhost:5672 and environment variables are set.

```
cd producer
npm install
npm run start:dev
```

API will be available at http://localhost:8080

### Consumer

```
cd consumer
npm install
npm run start:dev
```

## Sending Messages

Send a POST request to the Producer:

```
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello from NestJS!"}'
```

Or use Swagger UI at http://localhost:8080/api-docs

The message will be:

- Received by Producer
- Published to RabbitMQ queue
- Consumed by Consumer
- Delivered to specified Telegram chat