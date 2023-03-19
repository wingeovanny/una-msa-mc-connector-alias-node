export interface Hierarchy {
  id: string;
  clientId: string;
  nodeType: string;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: null;
  origin?: string;
}

export interface ParamsNodeByClientId {
  clientId: string;
  nodeType: TypeHierarchy;
}

export interface IBranchNode {
  clientId: string;
  nodeType: TypeHierarchy;
  parent?: string;
  origin?: string;
}

export interface IBoxNode {
  id: number;
  quantity: number;
  nodeType: TypeHierarchy;
}

export enum TypeHierarchy {
  MERCHANT = 'M',
  BRANCH = 'S',
  BOX = 'C',
}

export interface QR {
  metadata: any;
  origin: any;
  parentId: number;
  accountType: string;
  status: string;
  type: string;
}

// Define una interfaz para el objeto de respuesta que contiene una propiedad "qrs" que es un arreglo de objetos QR
export interface ResponseBox {
  status: boolean;
  qrs: QR[];
  message: string;
}
