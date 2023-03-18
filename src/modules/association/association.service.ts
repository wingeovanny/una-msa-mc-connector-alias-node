import { ConfigurationProvider } from './../../providers/configuration/configuration.provider';
import {
  Campaign,
  StatusCampain,
} from './../../providers/campaing/interfaces/campaing';
import { CampaingProvider } from './../../providers/campaing/campaing.provider';
import {
  ParamsNodeByClientId,
  IBranchNode,
} from './../../providers/hierarchy/interfaces/hierarchy';
import { ResponseClient } from './../../providers/pts/dto/pts.dto';
import { PTSProvider } from './../../providers/pts/pts.provider';
import { AliasProvider } from './../../providers/alias/alias.provider';
import { HierarchyProvider } from '../../providers/hierarchy/hierarchy.provider';
import { ClientProvider } from '../../providers/client/client.provider';
import {
  ErrorCodes,
  ErrorObjectType,
  EntityDoesNotExistException,
} from '@deuna/node-shared-lib';

import { GetByType, SERVICE_NAME } from '../../constants/common';
import {
  ID_QR_DOES_NOT_EXIST,
  ENTITY_DOES_NOT_EXIST_DETAIL,
} from '../../constants/error';
import {
  AssociationQrMerchantDto,
  AssociationQrPersonDto,
} from './dto/association.dto';
import {
  AccountType,
  Alias,
  StatusAlias,
} from '../../providers/alias/dto/alias';
import { Client } from '../../providers/client/interfaces/clients';
import { Hierarchy } from '../../providers/hierarchy/interfaces/hierarchy';
import { Injectable } from '@nestjs/common';
const errors: ErrorObjectType[] = [
  {
    code: ErrorCodes.USER_ERROR_CODE,
    reason: ID_QR_DOES_NOT_EXIST,
    source: SERVICE_NAME,
    details: ENTITY_DOES_NOT_EXIST_DETAIL,
  },
];
@Injectable()
export class AssociationService {
  constructor(
    private providerAias: AliasProvider,
    private providerCampaing: CampaingProvider,
    private providerClient: ClientProvider,
    private readonly providerConfiguration: ConfigurationProvider,
    private providerHierarchy: HierarchyProvider,
    private providerPts: PTSProvider,
  ) {}

  async associateMerchantQr(associationData: AssociationQrMerchantDto) {
    const promiseAlias = this.getAliasById(associationData.idQr);
    const promiseClient = this.getClientByRuc(associationData.identification);

    const [resultAlias, resultClientMerchant] = await Promise.all([
      promiseAlias,
      // promisePts,
      promiseClient,
    ]);
    const resultCampaing = await this.providerCampaing.getCampainById(
      resultAlias.origin,
    );

    if (this.validateAssociation(resultAlias, resultCampaing)) {
      const getNodeMerchant: ParamsNodeByClientId = {
        clientId: resultClientMerchant.id,
        nodeType: 'M',
      };
      const parentIdNode = await this.providerHierarchy.getNodeMerchant(
        getNodeMerchant,
      );
      console.log('Se consuilta el nodo del MERCHANT: ', parentIdNode);

      const branchNodeCreate: IBranchNode = {
        clientId: resultClientMerchant.id,
        nodeType: 'S',
        parent: parentIdNode.toString(),
      };

      //const nodeIdbranch = res.data.createNodeHierachy.id;
      const idNodeBranch = await this.providerHierarchy.createNodeBranch(
        branchNodeCreate,
      );

      console.log('Creado node de branch', idNodeBranch.id);

      const createConfigBranch =
        await this.providerConfiguration.createConfigurationBranch(
          idNodeBranch.id,
          parentIdNode[0].id,
          resultCampaing.name,
        );

      console.log(createConfigBranch);
      return 'OK';
      const updateAlias = {
        ...resultAlias,
        metadata: {
          ...resultAlias.metadata,
          accountNumber: '12345678', //resultPts.documentNumber,
          accountDestination: 'MAMBU1',
        },
        accountType: AccountType.MERCHANT,
        status: StatusAlias.ACTIVE,
      };

      delete updateAlias.requirementId;
      const result = await this.associateQr(associationData.idQr, updateAlias);
      console.log('Response...', result);
      return {
        status: true,
        message: `This IdQr get association: ${associationData.idQr}`,
      };
    } else {
      return {
        status: false,
        message: `This IdQr not get association, because of association ${associationData.idQr}`,
      };
    }
  }

  async associatePersonQr(associationData: AssociationQrPersonDto) {
    const promiseAlias = this.getAliasById(associationData.idQr);
    /*const promisePts = await this.getClientPts(
      GetByType.PHONE,
      associationData.cellPhone,
      associationData.idQr,
    );*/

    const [resultAlias] = await Promise.all([
      promiseAlias,
      // promisePts,
    ]);

    const updateAlias = {
      ...resultAlias,
      metadata: {
        ...resultAlias.metadata,
        accountNumber: '12345678', //resultPts.documentNumber,
        accountDestination: 'MAMBU1',
      },
      accountType: AccountType.PERSON,
      status: StatusAlias.ACTIVE,
    };

    delete updateAlias.requirementId;
    const result = await this.associateQr(associationData.idQr, updateAlias);
    if (result.status) {
      console.log('Response...', result);
      return {
        status: true,
        message: `This IdQr has been associated ${associationData.idQr}`,
      };
    } else {
      throw new EntityDoesNotExistException(errors);
    }
  }

  associateQr(idQr: string, dataUpdate: Alias) {
    return this.providerAias.associationQR(idQr, dataUpdate, idQr);
  }

  validateAssociation(dataAlias: Alias, dataCampaing: Campaign): boolean {
    if (
      dataAlias.status === StatusAlias.ACTIVE &&
      dataCampaing.status === StatusCampain.ACTIVE
    ) {
      return true;
    }
  }
  async getAliasById(idAlias: string) {
    const resultAlias: Alias = await this.providerAias.getAliasbyId(idAlias);
    if (!resultAlias) {
      throw new EntityDoesNotExistException(errors);
    }

    return resultAlias;
  }

  async getClientByRuc(ruc: string) {
    const result: Client = await this.providerClient.getClientByRuc(ruc);
    if (!result) {
      throw new EntityDoesNotExistException(errors);
    }
    return result;
  }

  async getHierarchyParent(idNode: number) {
    const result: Hierarchy[] =
      await this.providerHierarchy.getHierarchyChildrenParent(idNode);
    if (!result) {
      throw new EntityDoesNotExistException(errors);
    }
    return result;
  }

  async getClientPts(type: GetByType, identifier: string, trackingId: string) {
    const result: ResponseClient = await this.providerPts.getClient(
      type,
      identifier,
      trackingId,
    );
    if (!result) {
      throw new EntityDoesNotExistException(errors);
    }
    return result;
  }
}
