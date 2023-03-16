import { ResponseClient } from './../../providers/pts/dto/pts.dto';
import { PTSProvider } from './../../providers/pts/pts.provider';
import { AliasProvider } from './../../providers/alias/alias.provider';
import { HierarchyProvider } from '../../providers/hierarchy/hierarchy.provider';
import { ClientProvider } from '../../providers/client/client.provider';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ErrorCodes,
  ErrorObjectType,
  EntityDoesNotExistException,
} from '@deuna/node-shared-lib';

import { GetByType, SERVICE_NAME } from '../../constants/common';
import {
  CLIENT_DOES_NOT_EXIST,
  CLIENT_DOES_NOT_EXIST_DETAIL,
} from '../../constants/error';
import {
  AssociationQrMerchantDto,
  AssociationQrPersonDto,
  Client,
  Hierarchy,
} from './dto/association.dto';
import { Alias } from '../../providers/alias/interfaces/alias';
const errors: ErrorObjectType[] = [
  {
    code: ErrorCodes.USER_ERROR_CODE,
    reason: CLIENT_DOES_NOT_EXIST,
    source: SERVICE_NAME,
    details: CLIENT_DOES_NOT_EXIST_DETAIL,
  },
];
@Injectable()
export class AssociationService {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
    private providerClient: ClientProvider,
    private providerHierarchy: HierarchyProvider,
    private providerAias: AliasProvider,
    private providerPts: PTSProvider,
  ) {}

  async associateMerchantQr(associationData: AssociationQrMerchantDto) {
    console.log(associationData);
  }

  async associatePersonQr(associationData: AssociationQrPersonDto) {
    console.log(associationData);
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
