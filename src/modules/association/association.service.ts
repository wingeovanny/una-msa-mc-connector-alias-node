import { ConfigurationProvider } from './../../providers/configuration/configuration.provider';
import {
  Campaign,
  StatusCampain,
} from './../../providers/campaing/interfaces/campaing';
import { CampaingProvider } from './../../providers/campaing/campaing.provider';
import {
  ParamsNodeByClientId,
  IBranchNode,
  TypeHierarchy,
  IBoxNode,
  ResponseBox,
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
      return {
        status: true,
        message: `This IdQr has been associated ${associationData.idQr}`,
      };
    } else {
      throw new EntityDoesNotExistException(errors);
    }
  }

  async associateMerchantQr(associationData: AssociationQrMerchantDto) {
    const promiseAlias = await this.getAliasById(associationData.idQr);
    const promiseClient = await this.getClientByRuc(
      associationData.identification,
    );

    const [resultAlias, clientMerchant] = await Promise.all([
      promiseAlias,
      promiseClient,
    ]);

    const resultCampaing = await this.providerCampaing.getCampainById(
      resultAlias.origin,
    );

    if (this.isValidAssociation(resultAlias, resultCampaing)) {
      //consultamos si existe un nodo creado como sucursal de una campaña
      const hierarchyByCampain = await this.getHierachyBranchByCampain(
        clientMerchant.id,
        resultCampaing,
      );
      let idNodeByCampainBranch = hierarchyByCampain?.id;
      if (!hierarchyByCampain) {
        idNodeByCampainBranch = await this.createBranchByCampain(
          clientMerchant.id,
          resultCampaing,
        );
      }

      const dataCreateBox: ResponseBox = await this.createBoxByCampain(
        idNodeByCampainBranch,
      );
      if (dataCreateBox && dataCreateBox.status) {
        const updateAlias = {
          ...resultAlias,
          metadata: {
            ...resultAlias.metadata,
            accountNumber: clientMerchant.clientAcountId,
            accountDestination: 'MAMBU1',
          },
          accountType: AccountType.MERCHANT,
          status: StatusAlias.ACTIVE,
          parentId: dataCreateBox.qrs[0].parentId.toString(),
        };

        //Se asocia el qr huerfano.
        delete updateAlias.requirementId;
        const result = await this.associateQr(
          associationData.idQr,
          updateAlias,
        );

        if (result.status) {
          this.updateConfigAndCampain(idNodeByCampainBranch, resultCampaing);
          return {
            status: true,
            message: `This IdQr has been associated ${associationData.idQr}`,
          };
        } else {
          throw new EntityDoesNotExistException(errors);
        }
      } else {
        return {
          status: dataCreateBox.status,
          message: dataCreateBox.message,
        };
      }
    } else {
      return {
        status: false,
        message: `This IdQr ${associationData.idQr} is not associated, because it is already associated or the campaign is inactive`,
      };
    }
  }

  async getHierachyBranchByCampain(
    idMerchant: string,
    campain: Campaign,
  ): Promise<Hierarchy> {
    const getNodeBranch: ParamsNodeByClientId = {
      clientId: idMerchant,
      nodeType: TypeHierarchy.BRANCH,
    };
    //consultamos las jerarquias/nodos de las sucursales del Merchant
    const hierarchyBranch = await this.providerHierarchy.getNodeHierarchyByType(
      getNodeBranch,
    );
    //filtramos la sucursal creada por el id de campaña
    return hierarchyBranch.find(
      (node) => node.clientId === idMerchant && node.origin === campain.id,
    );
  }

  async createBranchByCampain(idMerchant: string, campain: Campaign) {
    let idNodeBranchCreated = '';
    const getNodeMerchant: ParamsNodeByClientId = {
      clientId: idMerchant,
      nodeType: TypeHierarchy.MERCHANT,
    };

    //consultamos info del nodo del merchant
    const parentNode = await this.providerHierarchy.getNodeHierarchyByType(
      getNodeMerchant,
    );

    const idNodeMerchant = parentNode.find((node) => node);
    const branchNodeCreate: IBranchNode = {
      clientId: idMerchant,
      nodeType: TypeHierarchy.BRANCH,
      parent: idNodeMerchant.id,
      origin: campain.id,
    };

    //creamos el nodo/hierarchy de la sucursal
    const createdNodeBranch = await this.providerHierarchy.createNodeBranch(
      branchNodeCreate,
    );
    idNodeBranchCreated = createdNodeBranch.id;

    //con el id del node de la sucursal creamos la configuracion de la sucursal
    await this.providerConfiguration.createConfigurationBranch(
      idNodeBranchCreated,
      idNodeMerchant.id,
      campain.name,
    );

    return idNodeBranchCreated;
  }

  async createBoxByCampain(idNodeByCampainBranch: string) {
    const boxData: IBoxNode = {
      id: +idNodeByCampainBranch,
      quantity: 1,
      nodeType: TypeHierarchy.BOX,
    };
    return await this.providerHierarchy.createNodeBox(boxData);
  }

  async updateConfigAndCampain(
    idNodeByCampainBranch: string,
    resultCampaing: Campaign,
  ) {
    this.providerConfiguration.updateConfigNode(idNodeByCampainBranch, 'CN007');
    resultCampaing.active++;
    resultCampaing.desactive--;
    this.providerCampaing.updateCampaing(resultCampaing);
  }

  associateQr(idQr: string, dataUpdate: Alias) {
    return this.providerAias.associationQR(idQr, dataUpdate, idQr);
  }

  isValidAssociation(dataAlias: Alias, dataCampaing: Campaign): boolean {
    return (
      dataAlias.status === StatusAlias.INACTIVE &&
      dataCampaing.status === StatusCampain.ACTIVE
    );
  }
  async getAliasById(idAlias: string): Promise<Alias> {
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
  /*
  async getHierarchyParent(idNode: number) {
    const result: Hierarchy[] =
      await this.providerHierarchy.getHierarchyChildrenParent(idNode);
    if (!result) {
      throw new EntityDoesNotExistException(errors);
    }
    return result;
  }
*/
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
