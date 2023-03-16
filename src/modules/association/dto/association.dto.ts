import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AssociationQrDto {
  @ApiProperty({ description: 'number cellPhone' })
  @IsNotEmpty()
  idQr: string;

  @ApiProperty({ description: 'number cellPhone' })
  cellPhone?: string;

  @ApiProperty({ description: 'number cellPhone' })
  identification?: string;
}

export class Client {
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

export class Hierarchy {
  id: string;
  clientId: string;
  nodeType: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: null;
}
