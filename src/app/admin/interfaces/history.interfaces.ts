import { IEntry } from ".";

export interface IOutput {
  id: number;
  productId: number;
  observation?: string;
  quantity: number;
  requisitionId?: number;
  motive: string;
}

export interface IHistory {
  entries: IEntry;
  outputs: IOutput;
}

