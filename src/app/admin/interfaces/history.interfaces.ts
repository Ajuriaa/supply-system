import { IEntry, IProduct, IRequisition } from ".";

export interface IOutput {
  id: number;
  product: IProduct;
  observation?: string;
  quantity: number;
  currentQuantity: number;
  date: Date;
  price: number;
  requisition?: IRequisition;
  motive: string;
  systemDate: Date;
}

export interface IHistory {
  entries: IEntry[];
  outputs: IOutput[];
}

export interface IMergedHistory {
  date: Date;
  product: string;
  unit: string;
  initialQuantity: number;
  type: string;
  quantity: number;
  price: number;
  finalQuantity: number;
  document: string
}
