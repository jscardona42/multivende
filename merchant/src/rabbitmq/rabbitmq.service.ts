import { Injectable } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import { rabbitmqConfig } from './rabbitmq.config';

@Injectable()
export class RabbitmqService {
  private channel: Channel;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const connection = await connect({
      hostname: rabbitmqConfig.hostname,
      username: rabbitmqConfig.username,
      password: rabbitmqConfig.password,
    });

    this.channel = await connection.createChannel();
    await this.channel.assertQueue(rabbitmqConfig.queueName);
  }

  async sendMessage(message: any): Promise<void> {
    const buffer = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(rabbitmqConfig.queueName, buffer);
  }

  async receiveMessage(): Promise<any> {
    const message = await this.channel.get(rabbitmqConfig.queueName);
    if (message) {
      this.channel.ack(message);
      return JSON.parse(message.content.toString());
    }

    return null;
  }
}
