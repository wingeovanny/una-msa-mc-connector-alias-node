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
import { SERVICE_NAME } from '../../constants/common';
import { AssociationService } from './association.service';
import { AssociationQrDto } from './dto/association.dto';

@ApiTags(SERVICE_NAME)
@Controller('association')
export class AssociationController {
  constructor(
    private logger: Logger,
    private associationService: AssociationService,
  ) {}
  @Post()
  @ApiBadRequestResponse({
    description: INVALID_PAYLOAD_ERROR,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiOperation({
    summary: 'associates an orphaned qr to a client type person or business',
  })
  @ApiBody({ type: AssociationQrDto })
  async associateQr(@Body() associationQrDto: AssociationQrDto) {
    this.logger.log(`create Alias qr for given body`, null);
    return this.associationService.associateQr(associationQrDto);
  }
}
