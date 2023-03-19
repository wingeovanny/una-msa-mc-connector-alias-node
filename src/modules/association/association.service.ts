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

  async associateMerchantQr(associationData: AssociationQrMerchantDto) {
    const promiseAlias = await this.getAliasById(associationData.idQr);
    const promiseClient = await this.getClientByRuc(
      associationData.identification,
    );
    //consultamos info de alias y de merchant
    const [resultAlias, clientMerchant] = await Promise.all([
      promiseAlias,
      promiseClient,
    ]);

    //consultamos info de campaña
    const resultCampaing = await this.providerCampaing.getCampainById(
      resultAlias.origin,
    );
    //validamos que la campaña este activa
    if (this.isValidAssociation(resultAlias, resultCampaing)) {
      const getNodeBranch: ParamsNodeByClientId = {
        clientId: clientMerchant.id,
        nodeType: TypeHierarchy.BRANCH,
      };

      //consultamos las jerarquias/nodos de las sucursales del Merchant
      const hierarchyBranch =
        await this.providerHierarchy.getNodeHierarchyByType(getNodeBranch);

      //filtramos la sucursal creada por el id de campaña
      const idBranchByCampain = hierarchyBranch.find(
        (node) =>
          node.clientId === clientMerchant.id &&
          node.origin === resultCampaing.id,
      );

      let idNodeBranch = idBranchByCampain?.id;
      // si no existe creamos la sucursal
      if (!idBranchByCampain) {
        const getNodeMerchant: ParamsNodeByClientId = {
          clientId: clientMerchant.id,
          nodeType: TypeHierarchy.MERCHANT,
        };

        //consultamos info del nodo del merchant
        const parentNode = await this.providerHierarchy.getNodeHierarchyByType(
          getNodeMerchant,
        );

        const idNodeMerchant = parentNode.find((node) => node);
        const branchNodeCreate: IBranchNode = {
          clientId: clientMerchant.id,
          nodeType: TypeHierarchy.BRANCH,
          parent: idNodeMerchant.id,
          origin: resultCampaing.id,
        };

        //const nodeIdbranch = res.data.createNodeHierachy.id;
        const createrNodeBranch = await this.providerHierarchy.createNodeBranch(
          branchNodeCreate,
        );
        idNodeBranch = createrNodeBranch.id;
        //con el id del node de la sucursal creamos la configuracion de la sucursal

        const createConfigBranch =
          await this.providerConfiguration.createConfigurationBranch(
            idNodeBranch,
            idNodeMerchant.id,
            resultCampaing.name,
          );
        console.log('SE CREO POR FIN... ', createConfigBranch);
      }
      console.log('01edwib');
      //creamos el nodo para cada caja
      const boxData: IBoxNode = {
        id: +idNodeBranch,
        quantity: 1,
        nodeType: TypeHierarchy.BOX,
      };
      const dataCreateBox: ResponseBox =
        await this.providerHierarchy.createNodeBox(boxData);
      console.log('Resultado de crear BOOOOOOOX', dataCreateBox);
      if (dataCreateBox) {
        console.log('133');
        const updateAlias = {
          ...resultAlias,
          metadata: {
            ...resultAlias.metadata,
            accountNumber: clientMerchant.clientAcountId, //resultPts.documentNumber,
            accountDestination: 'MAMBU1',
          },
          accountType: AccountType.MERCHANT,
          status: StatusAlias.ACTIVE,
          parentId: dataCreateBox.qrs[0].parentId.toString(),
        };

        delete updateAlias.requirementId;
        const result = await this.associateQr(
          associationData.idQr,
          updateAlias,
        );
        if (result.status) {
          console.log('Response... ASOCIATE SERVICE:', result);

          console.log('invocar a para actualizar el CN007');
          console.log('invocar para actualizar campaing');
          return {
            status: true,
            message: `This IdQr has been associated ${associationData.idQr}`,
          };
        } else {
          throw new EntityDoesNotExistException(errors);
        }
      }
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

  isValidAssociation(dataAlias: Alias, dataCampaing: Campaign): boolean {
    console.log('estado alias: ', dataAlias.status);
    console.log('estdo campaña: ', dataCampaing.status);
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
