import { Campaign } from './interfaces/campaing';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CAMPAING_BASE_URL, ENDPOINTS } from './constants/api';
import { CustomException } from '@deuna/node-shared-lib';

@Injectable()
export class CampaingProvider {
  constructor(private httpService: HttpService) {}
  async getCampainById(idCampaign: string): Promise<Campaign> {
    try {
      const { data: response } = await lastValueFrom(
        this.httpService.get(
          `${CAMPAING_BASE_URL}${ENDPOINTS.CAMPAING}/${idCampaign}`,
          {},
        ),
      );

      return response;
    } catch (e) {
      throw new CustomException(e, null);
    }
  }

  async updateCampaing(updateCampaing: Campaign) {
    try {
      const updateBody = { ...updateCampaing };
      delete updateBody.id;
      updateCampaing.createdBy = 'AssociationModule';

      const { data: response } = await lastValueFrom(
        this.httpService.put(
          `${CAMPAING_BASE_URL}${ENDPOINTS.CAMPAING}/${updateCampaing.id}`,
          updateBody,
        ),
      );

      return response;
    } catch (e) {
      throw new CustomException(e, null);
    }
  }
}
