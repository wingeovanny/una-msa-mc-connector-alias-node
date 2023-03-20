import { Configuration, CreateConfigDto } from './interfaces/configuration';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { endpoints } from './constants/api';

@Injectable()
export class ConfigurationProvider {
  constructor(private httpService: HttpService) {}

  async updateConfigNode(nodeIdHierarchy: string, configName: string) {
    const configNode = await this.getConfigByOneNodeId(
      +nodeIdHierarchy,
      configName, //'CN007',
    );

    let numberBoxValue = configNode.configData['numberBox'] as number;
    numberBoxValue++;
    const dataConfig = {
      ...configNode,
      configData: {
        ...configNode.configData,
        numberBox: numberBoxValue.toString(),
      },
    };
    await this.createConfigurationBranchApi(dataConfig);
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

  async createConfigurationBranch(
    nodeIdBranch: string,
    nodeIdHierarchy: string,
    campainName: string,
  ) {
    const configMerchant = await this.getConfigByOneNodeId(
      +nodeIdHierarchy,
      'CN004',
    );

    const configBranchData = await this.setDataConfigBranch(
      nodeIdBranch,
      campainName,
      configMerchant,
    );

    await this.createConfigurationBranchApi(configBranchData);
  }

  async createConfigurationBranchApi(
    createConfig: any,
  ): Promise<Configuration[]> {
    const { data: response } = await lastValueFrom(
      this.httpService.post(
        `${process.env.bo_mc_configuration_service}${endpoints.CONFIG}/all`,
        { configurations: createConfig },
      ),
    );
    return response;
  }

  async setDataConfigBranch(
    idNodeBranch: string,
    nameBranch: string,
    dataMerchant: CreateConfigDto,
  ) {
    const configurationBranchs: any = [];
    configurationBranchs.push(this.createDataCN007(idNodeBranch, nameBranch));

    configurationBranchs.push(this.createDataCN008(idNodeBranch, dataMerchant));
    configurationBranchs.push(this.createDataCN009(idNodeBranch));
    return configurationBranchs;
  }

  //branch data
  createDataCN007(nodeId: string, nameBranch: string): CreateConfigDto {
    return {
      configName: 'CN007',
      nodeId,
      configData: {
        branchName: nameBranch,
        numberBox: '0',
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
