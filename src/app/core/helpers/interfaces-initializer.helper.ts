import { IGroup, IProduct } from "src/app/admin/interfaces";

export const EMPTY_GROUP: IGroup = {
  id: 0,
  name: ""
};

export const EMPTY_PRODUCT: IProduct = {
  id: 0,
  name: "",
  unit: "",
  batches: [],
  group: EMPTY_GROUP
};
