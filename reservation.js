const amqp = require("amqplib");

async function startReservationService() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const EXCHANGE = "eventExchange";
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const QUEUE = "reservationQueue";
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, "order.created");

  console.log("[Reservation Service] Waiting for events...");
  channel.consume(QUEUE, async (msg) => {
    const data = JSON.parse(msg.content.toString());
    console.log(
      `[Reservation Service] Processing reservation for order ${data.orderId}`
    );

    const seatsAvailable = data.seats <= 5;
    const event = {
      eventType: seatsAvailable ? "SeatsReserved" : "SeatsNotReserved",
      orderId: data.orderId,
    };

    channel.publish(
      EXCHANGE,
      seatsAvailable ? "reservation.success" : "reservation.failed",
      Buffer.from(JSON.stringify(event))
    );
    console.log(`[Reservation Service] Published ${event.eventType} event.`);

    channel.ack(msg);
  });
}

startReservationService();
