const amqp = require('amqplib');

async function startPaymentService() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const EXCHANGE = 'eventExchange';
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  const QUEUE = 'paymentQueue';
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, 'reservation.success');

  console.log('[Payment Service] Waiting for events...');
  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(`[Payment Service] Processing payment for order ${data.orderId}`);

    const event = {
      eventType: 'PaymentAccepted',
      orderId: data.orderId,
    };

    channel.publish(EXCHANGE, 'payment.accepted', Buffer.from(JSON.stringify(event)));
    console.log('[Payment Service] Published PaymentAccepted event.');

    channel.ack(msg);
  });
}

startPaymentService();
