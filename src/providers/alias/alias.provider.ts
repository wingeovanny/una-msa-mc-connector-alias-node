import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CORE_ALIAS_BASE_URL, ENDPOINTS } from './constants/api';
import { HttpService } from '@nestjs/axios';
import { Alias } from './interfaces/alias';

@Injectable()
export class AliasProvider {
  constructor(private httpService: HttpService) {}
  async getAliasbyId(idQr: string): Promise<Alias> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(`${CORE_ALIAS_BASE_URL}${ENDPOINTS.ALIAS}${idQr}`),
    );
    return response;
  }
}
