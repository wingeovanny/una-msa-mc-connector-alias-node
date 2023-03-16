import { LoggerModule } from '@deuna/node-logger-lib';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KAFKA_CLIENT_CONFIG } from '../../config/kafka';
import { ClientModule } from '../../providers/client/client.module';
import { HierarchyModule } from '../../providers/hierarchy/hierarchy.module';
import { BondingService } from './bonding.service';
import { BondingController } from './bonding.controller';

@Module({
  imports: [
    ClientModule,
    HierarchyModule,
    LoggerModule.forRoot({ context: 'Bonding Module' }),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        ...KAFKA_CLIENT_CONFIG,
      },
    ]),
  ],
  controllers: [BondingController],
  providers: [BondingService],
})
export class BondingModule {}
