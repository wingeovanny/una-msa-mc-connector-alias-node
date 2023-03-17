export class Alias {
  requirementId: string;
  secondId: string;
  parentId: string;
  metadata: Record<string, unknown>;
  status: StatusAlias;
  origin: string;
  aliasType: string;
  accountType: AccountType;
}

export enum AccountType {
  MERCHANT = 'merchant',
  PERSON = 'person',
}

export enum StatusAlias {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
