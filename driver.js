const amqp = require('amqplib');

async function placeOrder(orderId, seats){
    const connection = await amqp.connect('amqp://localhost');
    const channel= await connection.createChannel();
    const queueName = 'orderQueue';
    await channel.assertQueue(queueName,{durable:true});
    const order = {
        orderId,
        seats
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(order)));
    console.log(`[Driver] Order placed: ${orderId}, Seats: ${seats}`);

    setTimeout(() => {
        connection.close();
      }, 500); 
}

(async () => {
    await placeOrder('order123', 2);
    await placeOrder('order124', 4);
  })();