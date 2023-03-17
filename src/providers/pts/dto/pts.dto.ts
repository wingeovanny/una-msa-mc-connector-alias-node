export class ResponseClient {
  firstName: string;

  lastName: string;

  accountNumber: string;

  currency: string;

  detail: Detail;

  status: string;

  documentNumber: string;
}

class Detail {
  externalAccountNumber: string;
  qr: string;
  cellphone: string;
}
export interface TokenPts {
  accessToken: string;
  secondsLeft: number;
}
