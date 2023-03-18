export class CreateConfigDto {
  id?: string;
  configName: string;
  nodeId: string;
  configData: Record<string, unknown>;
}

export class ConfigurationsDto {
  configurations: CreateConfigDto[];
}

export class Branch {
  branchName: string;
  numberBox: number;
  province: string;
  canton: string;
  mainStreet: string;
  secondaryStreet: string;
  reference: string;
  latitud: string;
  longitud: string;
  administratorName: string;
  notificationBranchPay: string;
  notificationSMS: string;
  notificationEmail: string;
  countryCode: string;
  cellPhone: string;
  email: string;
}
