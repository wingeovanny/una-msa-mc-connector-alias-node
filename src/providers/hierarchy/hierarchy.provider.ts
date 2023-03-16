import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ENDPOINTS } from './constants/api';
import { HttpService } from '@nestjs/axios';
import { Hierarchy } from './interfaces/hierarchy';

@Injectable()
export class HierarchyProvider {
  constructor(private httpService: HttpService) {}
  async getHierarchyChildrenParent(idNode: number): Promise<Hierarchy[]> {
    const { data: response } = await lastValueFrom(
      this.httpService.get(
        `${process.env.bo_mc_hierarchy_service}${ENDPOINTS.HIERARCHY}${idNode}/parents`,
      ),
    );
    return response;
  }
}
