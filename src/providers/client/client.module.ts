import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@deuna/node-logger-lib';
import { ClientProvider } from './client.provider';

@Module({
  imports: [HttpModule, LoggerModule.forRoot({ context: 'Client Provider' })],
  exports: [ClientProvider],
  providers: [ClientProvider],
})
export class ClientModule {}
