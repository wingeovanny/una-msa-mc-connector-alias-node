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
    console.log('AQUI100');
    const promiseAlias = await this.getAliasById(associationData.idQr);
    console.log('AQUI1000');
    const promiseClient = await this.getClientByRuc(
      associationData.identification,
    );
    //consultamos info de alias y de merchant
    console.log('AQUI10000');
    const [resultAlias, clientMerchant] = await Promise.all([
      promiseAlias,
      promiseClient,
    ]);

    //consultamos info de campaña
    console.log('AQUI2');
    const resultCampaing = await this.providerCampaing.getCampainById(
      resultAlias.origin,
    );
    console.log('AQUI31');
    //validamos que la campaña este activa
    if (this.isValidAssociation(resultAlias, resultCampaing)) {
      const getNodeBranch: ParamsNodeByClientId = {
        clientId: clientMerchant.id,
        nodeType: TypeHierarchy.BRANCH,
      };
      console.log('AQUI2');
      //consultamos las jerarquias/nodos de las sucursales del Merchant
      const hierarchyBranch =
        await this.providerHierarchy.getNodeHierarchyByType(getNodeBranch);
      console.log('AQUI3');
      //filtramos la sucursal creada por el id de campaña
      const idBranchByCampain = hierarchyBranch.find(
        (node) =>
          node.clientId === clientMerchant.id &&
          node.origin === resultCampaing.id,
      );
      console.log('AQUI14');
      let idNodeBranch = '';
      // si no existe creamos la sucursal
      if (!idBranchByCampain) {
        const getNodeMerchant: ParamsNodeByClientId = {
          clientId: clientMerchant.id,
          nodeType: TypeHierarchy.MERCHANT,
        };
        console.log('AQUI15');
        //consultamos info del nodo del merchant
        const parentNode = await this.providerHierarchy.getNodeHierarchyByType(
          getNodeMerchant,
        );
        console.log('AQUI16');
        const idNodeMerchant = parentNode.find((node) => node);
        console.log('Se consuilta el nodo del MERCHANT: ', parentNode);
        console.log('AQUI17');
        const branchNodeCreate: IBranchNode = {
          clientId: clientMerchant.id,
          nodeType: TypeHierarchy.BRANCH,
          parent: idNodeMerchant.id,
          origin: resultCampaing.id,
        };
        console.log('18');
        //const nodeIdbranch = res.data.createNodeHierachy.id;
        const createrNodeBranch = await this.providerHierarchy.createNodeBranch(
          branchNodeCreate,
        );
        console.log('Creado node de branch', createrNodeBranch);
        idNodeBranch = createrNodeBranch.id;
        //con el id del node de la sucursal creamos la configuracion de la sucursal
        console.log('19');
        const createConfigBranch =
          await this.providerConfiguration.createConfigurationBranch(
            idNodeBranch,
            idNodeMerchant.id,
            resultCampaing.name,
          );
        console.log('SE CREO POR FIN... ', createConfigBranch);
      }
      console.log('111');
      //creamos el nodo para cada caja
      const boxData: IBoxNode = {
        id: +idNodeBranch,
        quantity: 1,
        nodeType: TypeHierarchy.BOX,
      };
      console.log('122');
      const dataCreateBox = await this.providerHierarchy.createNodeBox(boxData);
      console.log('Resultado de crear BOOOOOOOX', dataCreateBox);
      if (dataCreateBox) {
        console.log('133');
        const updateAlias = {
          ...resultAlias,
          metadata: {
            ...resultAlias.metadata,
            accountNumber: '987654321', //resultPts.documentNumber,
            accountDestination: 'MAMBU1MERCHANT',
          },
          accountType: AccountType.MERCHANT,
          status: StatusAlias.ACTIVE,
          parentId: dataCreateBox.parentId,
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
        console.log('Response... QR ASOCIADOOO:::: ', result);
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
