export class Campaign {
  id: string;

  name: string;

  createdBy: string;

  number: number;

  active: number;

  desactive: number;

  status: StatusCampain;
}

export enum StatusCampain {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
