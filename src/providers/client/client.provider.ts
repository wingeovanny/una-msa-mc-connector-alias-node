import { endpoints } from './constants/api';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Client } from './interfaces/clients';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClientProvider {
  constructor(private httpService: HttpService) {}

  async getClientByRuc(ruc: string): Promise<Client> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(
        `${process.env.bo_mc_client_service}${endpoints.CLIENTBYRUC}${ruc}`,
        {},
      ),
    );
    return response;
  }
}
