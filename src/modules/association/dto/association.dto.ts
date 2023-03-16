import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export abstract class BaseAssociationQrDto {
  @ApiProperty({ description: 'id unique Qr' })
  @IsNotEmpty()
  idQr: string;
}

export class AssociationQrMerchantDto extends BaseAssociationQrDto {
  @ApiProperty({
    example: '0930318759001',
    description: 'number identification by merchant',
  })
  @Matches(/^[0-9]+$/, { message: 'Only numbers  0-9' })
  @IsNotEmpty()
  identification: string;
}

export class AssociationQrPersonDto extends BaseAssociationQrDto {
  @ApiProperty({
    example: '593993894433',
    description: 'number cellPhone by person',
  })
  @Matches(/^[0-9]+$/, { message: 'Only numbers  0-9' })
  @IsNotEmpty()
  cellPhone: string;
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
