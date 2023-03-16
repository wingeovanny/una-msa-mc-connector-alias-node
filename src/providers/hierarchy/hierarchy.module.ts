import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@deuna/node-logger-lib';
import { HierarchyProvider } from './hierarchy.provider';

@Module({
  imports: [
    HttpModule,
    LoggerModule.forRoot({ context: 'Hierarchy Provider' }),
  ],
  exports: [HierarchyProvider],
  providers: [HierarchyProvider],
})
export class HierarchyModule {}
