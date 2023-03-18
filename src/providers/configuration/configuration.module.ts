import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@deuna/node-logger-lib';
import { ConfigurationProvider } from './configuration.provider';

@Module({
  imports: [
    HttpModule,
    LoggerModule.forRoot({ context: 'Configuration Provider' }),
  ],
  exports: [ConfigurationProvider],
  providers: [ConfigurationProvider],
})
export class ConfigurationModule {}
