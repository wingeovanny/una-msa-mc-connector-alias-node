import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@deuna/node-logger-lib';
import { ALL_EXCEPTION_FILTERS_FOR_PROVIDER } from '@deuna/node-shared-lib';
import { AssociationModule } from './modules/association/association.module';
import { MetaServiceModule } from './modules/meta-service/meta-service.module';
import configuration from './config/service-configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      load: [configuration],
    }),
    MetaServiceModule,
    LoggerModule.forRoot({ context: 'ConnectorAlias Service' }),
    AssociationModule,
  ],
  providers: [...ALL_EXCEPTION_FILTERS_FOR_PROVIDER],
})
export class ConnectorAliasServiceModule {}
