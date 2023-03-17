import { Logger } from '@deuna/node-logger-lib';
import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import qs from 'qs';
import { lastValueFrom, retry } from 'rxjs';

import {
  PTS_BASE_URL,
  CHANEL_ID,
  ENDPOINTS,
  MANAGE_ACCOUNT,
} from './constants/api';
import {
  CUSTOMER_COUNT_TTL_DELAY,
  PTS_RETRY_COUNT,
  PTS_RETRY_DELAY,
} from './config/pts';
import { GetByType, SERVICE_NAME } from '../../constants/common';
import {
  CUSTOMER_DOES_NOT_EXIST_REASON,
  DeUnaException,
  ErrorCodes,
  ErrorObjectType,
} from '@deuna/node-shared-lib';
import { transformCapitalize } from '../../utils/commons';
import { TokenPts, ResponseClient } from './dto/pts.dto';
import { clientSchema } from './constants/schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const objectMapper = require('object-mapper');

@Injectable()
export class PTSProvider {
  private token = '';
  constructor(
    private logger: Logger,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPtsToken(trackingId: string): Promise<TokenPts> {
    const authHeader = Buffer.from(
      `${process.env.PTS_USERNAME}:${process.env.PTS_PASSWORD}`,
    ).toString('base64');

    this.logger.log(`Generating PTS token`, trackingId);

    const {
      data: { access_token: accessToken, expires_in: expiresIn },
    } = await axios.post(
      `${process.env.PTS_BASE_URL}/adaptorOAS/auth/login`,
      qs.stringify({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          pCHANNEL: 'BACKOFFICE',
          Authorization: `Basic ${authHeader}`,
        },
      },
    );

    const secondsLeft =
      Math.floor(
        (new Date(expiresIn * 1000).getTime() - new Date().getTime()) / 1000,
      ) - CUSTOMER_COUNT_TTL_DELAY;

    this.logger.log(`Generated PTS token`, trackingId);

    return { accessToken, secondsLeft };
  }

  async generatePtsAuthToken(trackingId: string): Promise<string> {
    this.logger.log(`Getting PTS token`, trackingId);

    let ptsToken: string = await this.cacheManager.get(`pts_token`);

    if (!ptsToken) {
      const { accessToken, secondsLeft } = await this.getPtsToken(trackingId);

      await this.cacheManager.set(`pts_token`, accessToken, {
        ttl: secondsLeft,
      });

      ptsToken = accessToken;
    }

    this.logger.log(`Obtained PTS token`, trackingId);

    return ptsToken;
  }

  async getClient(
    type: GetByType,
    identifier: string,
    trackingId: string,
  ): Promise<ResponseClient> {
    const authToken = await this.generatePtsAuthToken(trackingId);

    this.logger.log(`Getting PTS account info for ${identifier}`, trackingId);

    const {
      data: {
        messageRS: { accountInfo },
      },
    } = await lastValueFrom(
      this.httpService
        .get(
          `${PTS_BASE_URL}${ENDPOINTS.CLIENT_INFO}/AK-${type}-${identifier}/account-info`,
          {
            params: {
              digitalService: MANAGE_ACCOUNT,
            },
            headers: {
              Authorization: `Bearer ${authToken}`,
              CHANNEL: CHANEL_ID.APP_MOVIL_IN,
            },
            timeout: Number(process.env.PTS_TIMEOUT),
          },
        )
        .pipe(retry({ count: PTS_RETRY_COUNT, delay: PTS_RETRY_DELAY })),
    );

    if (!accountInfo?.internalAccountId) {
      this.logger.log(
        `PTS provider accountInfo incomplete ${JSON.stringify(accountInfo)}`,
        trackingId,
      );
      const errorFind: ErrorObjectType[] = [
        {
          code: ErrorCodes.CUSTOMER_NOT_FOUND_ERROR_CODE,
          source: SERVICE_NAME,
          reason: CUSTOMER_DOES_NOT_EXIST_REASON,
          details: CUSTOMER_DOES_NOT_EXIST_REASON,
        },
      ];
      throw new DeUnaException(
        HttpStatus.NOT_FOUND,
        errorFind,
        CUSTOMER_DOES_NOT_EXIST_REASON,
        trackingId,
      );
    }
    const accountInfoModify = {
      ...accountInfo,
      name: transformCapitalize(accountInfo.name),
      lastName: transformCapitalize(accountInfo.lastName),
    };

    this.logger.log(`Obtained PTS account info for ${identifier}`, trackingId);

    return objectMapper(accountInfoModify, clientSchema);
  }
}
