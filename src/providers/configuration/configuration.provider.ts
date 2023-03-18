import { Branch, ConfigurationsDto, CreateConfigDto } from './interfaces/configuration';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { endpoints } from './constants/api';

@Injectable()
export class ConfigurationProvider {
  constructor(private httpService: HttpService) {}

  async createConfigurationBranch(
    nodeIdBranch: string,
    nodeIdMerchant: string,
    nameCampain: string,
  ) {
    const promiseConfigMerchant = this.getConfigByNode(+nodeIdMerchant);
    const promiseConfigBranch = this.getConfigByNode(+nodeIdBranch);

    const [configMerchant, configBranch] = Promise.all([
      promiseConfigMerchant,
      promiseConfigBranch,
    ]);

    const configBranch = this.setDataConfigBranch(+nodeIdBranch);
  }

  async getConfigByNode(idNode: number): Promise<CreateConfigDto[]> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(
        `${process.env.bo_mc_configuration_service}${endpoints.CONFIG}/${idNode}/search`,
        {},
      ),
    );
    return response;
  }

  async createConfigurationBranchApi(
    createConfig: CreateConfigDto[],
  ): Promise<CreateConfigDto[]> {
    const { data: response } = await lastValueFrom(
      this.httpService.post(
        `${process.env.bo_mc_configuration_service}${endpoints.CONFIG}/all`,
        { configurations: createConfig },
      ),
    );
    return response;
  }

  setDataConfigBranch(idNodeBranch: string) {
    const configurationBranchs: ConfigurationsDto = { configurations: [] };
    configurationBranchs.configurations.push(
      this.createDataCN007(idNodeBranch),
    );
    configurationBranchs.configurations.push(
      this.createDataCN008(idNodeBranch),
    );
    configurationBranchs.configurations.push(
      this.createDataCN009(idNodeBranch),
    );
  }

  createDataCN007(nodeId: string, dataConfig: Branch): CreateConfigDto {
    return {
      configName: 'CN007',
      nodeId,
      configData: {
        branchName: dataConfig.branchName,
        numberBox: 1,
      },
    };
  }

  //data for Ubication step branch
  createDataCN008(nodeId: string, dataConfig: Branch): CreateConfigDto {
    return {
      configName: 'CN008',
      nodeId,
      configData: {
        province: dataConfig.province,
        canton: dataConfig.canton,
        mainStreet: dataConfig.mainStreet,
        secondaryStreet: dataConfig.secondaryStreet,
        reference: dataConfig.reference,
        latitud: dataConfig.latitud,
        longitud: dataConfig.longitud,
      },
    };
  }

  // data for notification step-branch
  createDataCN009(nodeId: string, dataConfig: Branch): CreateConfigDto {
    return {
      configName: 'CN009',
      nodeId,
      configData: {
        administratorName: dataConfig.administratorName,
        notificationBranchPay: dataConfig.notificationBranchPay,
        optionNotificationBranchPay: {
          notificationSMS: dataConfig.notificationSMS,
          notificationEmail: dataConfig.notificationEmail,
          countryCode: dataConfig.countryCode,
          cellPhone: dataConfig.cellPhone,
          email: dataConfig.email,
        },
      },
    };
  }
}
