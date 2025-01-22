const amqp = require('amqplib');

async function startWaitlistService() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const EXCHANGE = 'eventExchange';
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  const QUEUE = 'waitlistQueue';
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, 'reservation.failed');
  console.log('[Waitlist Service] Waiting for events...');
  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(`[Waitlist Service] Adding order ${data.orderId} to the waitlist.`);
    console.log(`[Waitlist Service] Order ${data.orderId} added to waitlist.`);
    channel.ack(msg);
  });
}

startWaitlistService();
