import { IProduct } from ".";

export interface IRequisition {
  id: number;
  employeeId: number;
  department: string;
  documentUrl?: string;
  employeeName: string;
  bossName: string;
  state: IState;
  productRequisition: IProductRequisition[];
}

export interface IState {
  id: number;
  state: string;
}

export interface IProductRequisition {
  id: number;
  quantity: number;
  product: IProduct;
  requisition: IRequisition;
}

export interface IRequisitionResponse {
  data: IRequisition[];
}
