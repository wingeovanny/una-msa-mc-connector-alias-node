import { IsObject } from 'class-validator';

export class CreateConfigDto {
  id?: string;
  configName: string;
  nodeId: string;
  @IsObject()
  configData: Record<string, unknown>;
}

export class ConfigurationsDto {
  configurations: CreateConfigDto[];
}
