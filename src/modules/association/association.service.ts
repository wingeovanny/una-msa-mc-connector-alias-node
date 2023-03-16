import { HierarchyProvider } from '../../providers/hierarchy/hierarchy.provider';
import { ClientProvider } from '../../providers/client/client.provider';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ErrorCodes,
  ErrorObjectType,
  EntityDoesNotExistException,
} from '@deuna/node-shared-lib';

import { SERVICE_NAME } from '../../constants/common';
import {
  CLIENT_DOES_NOT_EXIST,
  CLIENT_DOES_NOT_EXIST_DETAIL,
} from '../../constants/error';
import { AssociationQrDto, Client, Hierarchy } from './dto/association.dto';
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
  ) {}

  async associateQr(associationData: AssociationQrDto) {
    console.log(associationData);
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
}
