import { PTSModule } from './../../providers/pts/pts.module';
import { LoggerModule } from '@deuna/node-logger-lib';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { KAFKA_CLIENT_CONFIG } from '../../config/kafka';
import { AliasModule } from '../../providers/alias/alias.module';
import { ClientModule } from '../../providers/client/client.module';
import { HierarchyModule } from '../../providers/hierarchy/hierarchy.module';
import { AssociationController } from './association.controller';
import { AssociationService } from './association.service';

@Module({
  imports: [
    ClientModule,
    HierarchyModule,
    AliasModule,
    PTSModule,
    LoggerModule.forRoot({ context: 'Association Module' }),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        ...KAFKA_CLIENT_CONFIG,
      },
    ]),
  ],
  controllers: [AssociationController],
  providers: [AssociationService],
})
export class AssociationModule {}
