import { KafkaOptions, Transport } from '@nestjs/microservices';

export const KAFKA_CLIENT_CONFIG: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: process.env.KAFKA_URLS.split(','),
      ...(process.env.KAFKA_SSL_ENABLED === 'true'
        ? {
            ssl: true,
            sasl: {
              mechanism: 'scram-sha-512',
              username: process.env.SASL_USERNAME,
              password: process.env.SASL_PASSWORD,
            },
          }
        : {}),
    },
    consumer: {
      groupId: 'notification-trx-pts-merchant-group',
    },
  },
};
