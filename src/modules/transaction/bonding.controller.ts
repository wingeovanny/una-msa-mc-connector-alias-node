import { Logger } from '@deuna/node-logger-lib';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SERVICE_NAME } from '../../constants/common';
import { BondingService } from './bonding.service';

@ApiTags(SERVICE_NAME)
@Controller('bonding')
export class BondingController {
  constructor(
    private logger: Logger,
    private transacctionService: BondingService,
  ) {}
  /*
  @Post()
  async sendNOtification(@Body() responseTransacctionKafka: any) {
    try {
      const jsonString = JSON.stringify(responseTransacctionKafka.data);
      const dataTransaction = JSON.parse(jsonString);
      if (dataTransaction?.statusRS && dataTransaction.statusRS.code === '0') {
        this.transacctionService.sendNotificationTransaction(dataTransaction);
      } else {
        console.log('ERROOR EN EL JSON DE LA COLA DE KAFKA', dataTransaction);
      }
    } catch (error) {
      console.error(error);
    }
  }*/
}
