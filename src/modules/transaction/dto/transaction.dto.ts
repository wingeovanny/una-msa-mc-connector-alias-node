export interface NotificationTransaction {
  dataMerchant: Client;
  dataHierarchy: Hierarchy[];
  dataTransaccion?: Transaccion;
}

export interface Client {
  id: string;
  clientAcountId?: string;
  identification: string;
  identificationType: string;
  businessName: string;
  comercialName: string;
  status: string;
  updateBy: string;
  createBy: string;
}

export interface Hierarchy {
  id: string;
  clientId: string;
  nodeType: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: null;
  configuration?: Configuration[];
  contacts?: NotificationContacts;
}

export interface Configuration {
  id: string;
  nodeId?: string;
  configName: string;
  configData: Record<string, unknown>;
}

export interface Transaccion {
  beneficiary_client_name: string;
  beneficiary_client_id: string;
  transactionDate: string;
  transactionId: string;
  origin_account_number: string;
  beneficiary_account_number: string;
  amount: number;
  transaction_description: string;
  origin_client_name: string;
  idPos: number;
}
/*
export interface FinalConfiguration {
  configName: string;
  email?: string;
  region?: string;
  cellPhone?: string;
  countryCode?: string;
  sms?: boolean;
  webhook?: boolean;
  optionBranch?: string;
  mailMerchantContact?: string;
  nameMerchatContact?: string;
  administratorName?: string;
  notificationBranchPay?: string;
  optionNotificationBranchPay?: {
    email?: string;
    cellPhone?: string;
    countryCode?: string;
    notificationSMS?: boolean;
    notificationEmail?: boolean;
  };
}
*/
export interface NotificationContacts {
  nameBranch: any;
  emailMerchant: any;
  cellPhoneMerchant: any;
  emailBranch: string;
  cellPhoneBranch: string;
}
