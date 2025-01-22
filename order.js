const amqp = require('amqplib');

async function startOrderService(){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const EXCHANGE='eventExchange';
    await channel.assertExchange(EXCHANGE,"topic",{durable:true});
    console.log("[Order Service] Waiting for messages...");
    channel.consume('orderQueue',async (msg)=>{
        const data= JSON.parse(msg.content.toString());
        console.log(`[Order Service] Recieved Order: ${data.orderId}`);
        const event={
            eventType: 'OrderCreated',
            orderId: data.orderId,
            seats: data.seats
        };
        channel.publish(EXCHANGE, 'order.created',Buffer.from(JSON.stringify(event)));
        console.log('[Order Service] Published OrderCreated event.');
        channel.ack(msg);
    });
}

startOrderService();