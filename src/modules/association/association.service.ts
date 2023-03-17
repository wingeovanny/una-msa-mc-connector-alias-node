import {
  IHierarchy,
  ParamsNodeByClientId,
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
    private providerClient: ClientProvider,
    private providerHierarchy: HierarchyProvider,
    private providerAias: AliasProvider,
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
    const getNodeMerchant: ParamsNodeByClientId = {
      clientId: resultClientMerchant.id,
      nodeType: 'M',
    };
    if (!this.validateAssociation) {
      const parent = await this.providerHierarchy.getNodeMerchant(
        getNodeMerchant,
      );
      console.log('Se consuilta el nodo del MERCHANT: ', parent);
      const branchCreate: IHierarchy = {
        clientId: resultClientMerchant.id,
        nodeType: 'S',
        parent: parent.toString(),
      };
      //const nodeIdbranch = res.data.createNodeHierachy.id;
      const idNodeBranch = await this.providerHierarchy.createNodeBranch(
        branchCreate,
      );
      console.log('Creado node de branch', idNodeBranch);
    }

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
  }

  validateAssociation(dataAlias: Alias): boolean {
    if (
      Object.keys(dataAlias.metadata).length === 0 ||
      !dataAlias.metadata.hasOwnProperty('accountNumber')
    ) {
      // Si metadata está vacío o no tiene la propiedad accountNumber
      return false;
    } else {
      // Si metadata tiene la propiedad accountNumber
      return true;
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
    console.log('Response...', result);
  }

  associateQr(idQr: string, dataUpdate: Alias) {
    return this.providerAias.associationQR(idQr, dataUpdate, idQr);
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
