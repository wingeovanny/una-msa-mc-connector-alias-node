export class CreateConfigDto {
  configName: string;
  nodeId: string;
  configData: Record<string, unknown>;
}

export class ConfigurationsDto {
  configurations: CreateConfigDto[];
}

export class Configuration {
  id: string;
  nodeId?: string;
  configName: string;
  configData: Record<string, unknown>;
}
