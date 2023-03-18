import { PTSModule } from './../../providers/pts/pts.module';
import { LoggerModule } from '@deuna/node-logger-lib';
import { Module } from '@nestjs/common';
import { AliasModule } from '../../providers/alias/alias.module';
import { ClientModule } from '../../providers/client/client.module';
import { HierarchyModule } from '../../providers/hierarchy/hierarchy.module';
import { AssociationController } from './association.controller';
import { AssociationService } from './association.service';
import { ErrorCustomizer } from '../../utils/customize-error';
import { ConfigurationModule } from '../../providers/configuration/configuration.module';
import { CampaingModule } from '../../providers/campaing/campaing.module';

@Module({
  imports: [
    AliasModule,
    CampaingModule,
    ClientModule,
    ConfigurationModule,
    HierarchyModule,
    PTSModule,
    LoggerModule.forRoot({ context: 'Association Module' }),
  ],
  controllers: [AssociationController],
  providers: [AssociationService, ErrorCustomizer],
})
export class AssociationModule {}
