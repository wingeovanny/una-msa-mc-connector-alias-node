import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@deuna/node-logger-lib';
import { CampaingProvider } from './campaing.provider';

@Module({
  imports: [HttpModule, LoggerModule.forRoot({ context: 'Campaing Provider' })],
  exports: [CampaingProvider],
  providers: [CampaingProvider],
})
export class CampaingModule {}
