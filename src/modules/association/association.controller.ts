import { Logger } from '@deuna/node-logger-lib';
import { INVALID_PAYLOAD_ERROR } from '@deuna/node-shared-lib';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AssociationService } from './association.service';
import {
  AssociationQrMerchantDto,
  AssociationQrPersonDto,
} from './dto/association.dto';

@ApiTags('association QR')
@Controller('association')
export class AssociationController {
  constructor(
    private logger: Logger,
    private associationService: AssociationService,
  ) {}
  @Post('person')
  @ApiBadRequestResponse({
    description: INVALID_PAYLOAD_ERROR,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiOperation({
    summary: 'associates an orphaned qr to a client type person',
  })
  @ApiBody({ type: AssociationQrPersonDto })
  async associateQrPerson(@Body() associationQrDto: AssociationQrPersonDto) {
    this.logger.log(`association Alias by person qr for given body`, null);
    return this.associationService.associatePersonQr(associationQrDto);
  }

  @Post('merchant')
  @ApiBadRequestResponse({
    description: INVALID_PAYLOAD_ERROR,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiOperation({
    summary: 'associates an orphaned qr to a client type business',
  })
  @ApiBody({ type: AssociationQrMerchantDto })
  async associateQrMerchant(
    @Body() associationQrDto: AssociationQrMerchantDto,
  ) {
    this.logger.log(`association Alias by merchant qr for given body`, null);
    return this.associationService.associateMerchantQr(associationQrDto);
  }
}
