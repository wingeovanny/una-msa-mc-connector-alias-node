import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@deuna/node-logger-lib';
import { AliasProvider } from './alias.provider';

@Module({
  imports: [HttpModule, LoggerModule.forRoot({ context: 'Alias Provider' })],
  exports: [AliasProvider],
  providers: [AliasProvider],
})
export class AliasModule {}
