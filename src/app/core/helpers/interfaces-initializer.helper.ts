import { IBatch, IGroup, IHistory, IMergedHistory, IProduct, ISupplier } from "src/app/admin/interfaces";

export const EMPTY_GROUP: IGroup = {
  id: 0,
  name: ""
};

export const EMPTY_BATCH: IBatch = {
  id: 0,
  due: new Date(),
  quantity: 0,
  price: 0
};

export const EMPTY_PRODUCT: IProduct = {
  id: 0,
  minimum: 0,
  perishable: false,
  batched: false,
  name: "",
  unit: "",
  batches: [],
  group: EMPTY_GROUP
};

export const EMPTY_HISTORY: IHistory = {
  entries: [],
  outputs: []
};

export const EMPTY_MERGED_HISTORY: IMergedHistory = {
  date: new Date(),
  product: "",
  unit: "",
  initialQuantity: 0,
  type: "",
  quantity: 0,
  finalQuantity: 0,
  document: "",
  price: 0
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
