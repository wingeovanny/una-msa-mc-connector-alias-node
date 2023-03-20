import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ENDPOINTS } from './constants/api';
import { HttpService } from '@nestjs/axios';
import {
  Hierarchy,
  IBoxNode,
  IBranchNode,
  ParamsNodeByClientId,
  ResponseBox,
} from './interfaces/hierarchy';
import { CustomException } from '@deuna/node-shared-lib';

@Injectable()
export class HierarchyProvider {
  constructor(private httpService: HttpService) {}
  /* async getHierarchyChildrenParent(idNode: number): Promise<Hierarchy[]> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(
        `${process.env.bo_mc_hierarchy_service}${ENDPOINTS.HIERARCHY}/${idNode}/parents`,
      ),
    );
    return response;
  }
*/
  async getNodeHierarchyByType(
    getNodeByClientId: ParamsNodeByClientId,
  ): Promise<Hierarchy[]> {
    try {
      const { data: response } = await lastValueFrom(
        this.httpService.get(
          `${process.env.bo_mc_hierarchy_service}${ENDPOINTS.HIERARCHY}?nodeType=${getNodeByClientId.nodeType}&merchantId=${getNodeByClientId.clientId}`,
          {},
        ),
      );
      return response;
    } catch (e) {
      throw new CustomException(e, null);
    }
  }

  async createNodeBranch(branchNode: IBranchNode): Promise<Hierarchy> {
    try {
      const { data: response } = await lastValueFrom(
        this.httpService.post(
          `${process.env.bo_mc_hierarchy_service}/hierarchy`,
          branchNode,
          {
            headers: {
              username: 'AssociationModule',
            },
          },
        ),
      );
      return response;
    } catch (e) {
      throw new CustomException(e, null);
    }
  }

  async createNodeBox(boxNode: IBoxNode): Promise<ResponseBox> {
    try {
      const { id, quantity, nodeType } = boxNode;
      const { data: response } = await lastValueFrom(
        this.httpService.post(
          `${process.env.bo_mc_hierarchy_service}/hierarchy/${id}/childrens`,
          {
            quantity,
            nodeType,
          },
          {
            headers: {
              username: 'AssociationModule',
            },
          },
        ),
      );
      return response;
    } catch (e) {
      throw new CustomException(e, null);
    }
  }
}
