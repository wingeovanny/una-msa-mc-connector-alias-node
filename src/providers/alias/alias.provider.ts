import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CORE_ALIAS_BASE_URL, ENDPOINTS } from './constants/api';
import { HttpService } from '@nestjs/axios';
import { Alias } from './dto/alias';
import { Logger } from '@deuna/node-logger-lib';
import { CustomException } from '@deuna/node-shared-lib';

@Injectable()
export class AliasProvider {
  constructor(private httpService: HttpService, private logger: Logger) {}
  async getAliasbyId(idQr: string): Promise<Alias> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(`${CORE_ALIAS_BASE_URL}${ENDPOINTS.ALIAS}${idQr}`),
    );

    return response;
  }

  async associationQR(
    idQr: string,
    associationData: Alias,
    trackingId: string,
  ) {
    try {
      this.logger.log(`associate qr for ${idQr}, alias WS`, trackingId);
      const associationBodyData = { ...associationData };
      const { data: response } = await lastValueFrom(
        this.httpService.put(
          `${CORE_ALIAS_BASE_URL}${ENDPOINTS.ALIAS}${idQr}`,
          {
            ...associationBodyData,
          },
        ),
      );
      this.logger.log(`associated qr for ${idQr}, alias WS`, trackingId);
      return response;
    } catch (e) {
      this.logger.error(`association qr ${idQr}, alias WS`, e);
      throw new CustomException(e, null);
    }
  }
}
