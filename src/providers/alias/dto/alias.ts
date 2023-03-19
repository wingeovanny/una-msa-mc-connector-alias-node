export class Alias {
  requirementId: string;
  secondId: string;
  metadata: Record<string, unknown>;
  status: StatusAlias;
  origin: string;
  aliasType: string;
  accountType: AccountType;
  parentId: string;
}

export enum AccountType {
  MERCHANT = 'merchant',
  PERSON = 'person',
}

export enum StatusAlias {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
