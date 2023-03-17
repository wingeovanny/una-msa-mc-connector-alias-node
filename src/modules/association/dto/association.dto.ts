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
