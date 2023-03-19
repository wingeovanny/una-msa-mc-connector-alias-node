import { ConfigurationsDto, CreateConfigDto } from './interfaces/configuration';
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
    campainName: string,
  ) {
    const configMerchant = await this.getConfigByOneNodeId(
      +nodeIdMerchant,
      'CN004',
    );

    console.log('config CN004 MERCHANT CONFIG PROVIDER::: ', configMerchant);
    const configBranchData = await this.setDataConfigBranch(
      nodeIdBranch,
      campainName,
      configMerchant,
    );
    const test = configBranchData.configurations.find(
      (e) => e.configName === 'CN008',
    );
    console.log('TESTTTTTT:', test);
    console.log('DATA SETEATDA configBranchData', configBranchData);
    const createdConfig = await this.createConfigurationBranchApi(
      configBranchData,
    );
    console.log(configBranchData);
    console.log(createdConfig);
  }

  async getConfigByOneNodeId(
    idNode: number,
    configName: string,
  ): Promise<CreateConfigDto> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(
        `${process.env.bo_mc_configuration_service}${endpoints.CONFIG}/${idNode}/search/${configName}`,
        {},
      ),
    );
    return response;
  }

  async createConfigurationBranchApi(
    createConfig: ConfigurationsDto,
  ): Promise<CreateConfigDto[]> {
    console.log('createConfigurationBranchApi', createConfig);
    const { data: response } = await lastValueFrom(
      this.httpService.post(
        `${process.env.bo_mc_configuration_service}${endpoints.CONFIG}/all`,
        { configurations: createConfig },
      ),
    );
    console.log('adasdasdasdasdasqwqeqweq,m,mkmolmkkn');
    return response;
  }

  async setDataConfigBranch(
    idNodeBranch: string,
    nameBranch: string,
    dataMerchant: CreateConfigDto,
  ): Promise<ConfigurationsDto> {
    console.log('setDataConfigBranch', dataMerchant);
    const configurationBranchs: ConfigurationsDto = { configurations: [] };
    configurationBranchs.configurations.push(
      this.createDataCN007(idNodeBranch, nameBranch),
    );
    configurationBranchs.configurations.push(
      this.createDataCN008(idNodeBranch, dataMerchant),
    );
    configurationBranchs.configurations.push(
      this.createDataCN009(idNodeBranch),
    );
    return configurationBranchs;
  }

  //branch data
  createDataCN007(nodeId: string, nameBranch: string): CreateConfigDto {
    return {
      configName: 'CN007',
      nodeId,
      configData: {
        branchName: nameBranch,
        numberBox: 0,
      },
    };
  }
  //branch location data
  createDataCN008(
    nodeId: string,
    dataMerchant: CreateConfigDto,
  ): CreateConfigDto {
    delete dataMerchant.id;
    const dataConfig = {
      ...dataMerchant,
      nodeId: nodeId,
      configName: 'CN008',
      configData: {
        ...dataMerchant.configData,
        latitud: '',
        longitud: '',
      },
    };
    return dataConfig;
  }

  // data for branch notification
  createDataCN009(nodeId: string): CreateConfigDto {
    return {
      configName: 'CN009',
      nodeId,
      configData: {
        administratorName: '',
        notificationBranchPay: '',
        optionNotificationBranchPay: {
          notificationSMS: '',
          notificationEmail: '',
          countryCode: '',
          cellPhone: '',
          email: '',
        },
      },
    };
  }
}
