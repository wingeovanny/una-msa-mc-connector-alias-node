export interface Hierarchy {
  id: string;
  clientId: string;
  nodeType: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: null;
}

export interface ParamsNodeByClientId {
  clientId: string;
  nodeType: string;
}

export interface IBranchNode {
  clientId: string;
  nodeType: string;
  parent?: string;
}

export interface IBoxNode {
  id: number;
  quantity: number;
  nodeType: string;
}
