import { CacheModule, Module } from '@nestjs/common';
import { LoggerModule } from '@deuna/node-logger-lib';
import { PTSProvider } from './pts.provider';
import { HttpModule } from '@nestjs/axios';

/**
 * @export
 * @class PTSModule
 */
@Module({
  imports: [
    LoggerModule.forRoot({ context: 'PTS Service' }),
    HttpModule,
    CacheModule.register(),
  ],
  providers: [PTSProvider],
  exports: [PTSProvider],
})
export class PTSModule {}
