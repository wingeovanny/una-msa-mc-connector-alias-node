import { ApiProperty } from '@nestjs/swagger';

export class ResponseClient {
  @ApiProperty({ description: 'First name' })
  firstName: string;
  @ApiProperty({ description: 'Last name' })
  lastName: string;
  @ApiProperty({ description: 'Currency' })
  currency: string;
  @ApiProperty({ description: 'Account type' })
  accountType: string;
  @ApiProperty({ description: 'Detail' })
  detail: PaymentChannelDetail;
  @ApiProperty({ description: 'Segment id' })
  segmentType: string;
  @ApiProperty({ description: 'Status' })
  status: string;
  @ApiProperty({ description: 'Document number' })
  documentNumber: string;
}

class PaymentChannelDetail {
  @ApiProperty({ description: 'External account number' })
  externalAccountNumber: string;
  @ApiProperty({ description: 'QR' })
  qr: string;
  @ApiProperty({ description: 'QR version' })
  qrVersion: string;
  @ApiProperty({ description: 'Cellphone' })
  cellphone: string;
}
export interface TokenPts {
  accessToken: string;
  secondsLeft: number;
}
