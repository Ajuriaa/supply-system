import { IGroup, IHistory, IProduct, ISupplier } from "src/app/admin/interfaces";

export const EMPTY_GROUP: IGroup = {
  id: 0,
  name: ""
};

export const EMPTY_PRODUCT: IProduct = {
  id: 0,
  minimum: 0,
  name: "",
  unit: "",
  batches: [],
  group: EMPTY_GROUP
};

export const EMPTY_HISTORY: IHistory = {
  entries: [],
  outputs: []
};

export const EMPTY_SUPPLIER: ISupplier = {
  id: 0,
  name: "",
  email: '',
  phone: '',
  address: '',
  rtn: '',
  entries: []
};
