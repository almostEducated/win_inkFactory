const stationSchema = {
  name: "station",
  properties: {
    _id: "objectId?",
    _partitionKey: "string?",
    location: "string?",
    name: "string?",
    stage: "string?",
  },
  primaryKey: "_id",
};

const employeeSchema = {
  name: "employee",
  properties: {
    _id: "objectId?",
    _partitionKey: "string?",
    email: "string?",
    empId: "string?",
    firstName: "string?",
    lastName: "string?",
    pay: "double?",
    phone: "string?",
    role: "string?",
  },
  primaryKey: "_id",
};
const time_stepsSchema = {
  name: "time_steps",
  embedded: true,
  properties: {
    empId: "string?",
    machine: "string?",
    start: "date?",
    stop: "date?",
  },
};

const timeSchema = {
  name: "time",
  properties: {
    _id: "objectId?",
    __v: "int?",
    _partitionKey: "string?",
    orderItemId: "string?",
    product: "string?",
    productId: "int?",
    scans: "int?",
    steps: { type: "list", objectType: "time_steps" },
  },
  primaryKey: "_id",
};

const productSchema = {
  name: "product",
  properties: {
    _id: "objectId?",
    __v: "int?",
    _partitionKey: "string?",
    creationId: "int?",
    name: "string?",
    productId: "int?",
    sku: "string[]",
    skus: "string[]",
    steps: "product_steps",
    tip: "string?",
  },
  primaryKey: "_id",
};

const product_stepsSchema = {
  name: "product_steps",
  embedded: true,
  properties: {
    step: "product_steps_step[]",
    total: "int?",
  },
};

const product_steps_stepSchema = {
  name: "product_steps_step",
  embedded: true,
  properties: {
    _id: "objectId?",
    info: "string?",
    machine: "string?",
  },
};

const itemSchema = {
  name: "item",
  properties: {
    _id: "objectId?",
    __v: "int?",
    _partitionKey: "string?",
    batchId: "string?",
    batchType: "string?",
    client: "string?",
    itemId: "string?",
    location: "item_location",
    name: "string?",
    orderId: "string?",
    orderItemId: "string?",
    orderNumber: "string?",
    originalDate: "date?",
    quantity: "item_quantity",
    reprint: "bool?",
    sku: "string?",
  },
  primaryKey: "_id",
};

const item_locationSchema = {
  name: "item_location",
  embedded: true,
  properties: {
    checkpoints: "item_location_checkpoints[]",
    current: "string?",
  },
};

const item_location_checkpointsSchema = {
  name: "item_location_checkpoints",
  embedded: true,
  properties: {
    _id: "objectId?",
    date: "date?",
    empId: "string?",
    loc: "string?",
  },
};

const item_quantitySchema = {
  name: "item_quantity",
  embedded: true,
  properties: {
    numOf: "int?",
    total: "int?",
  },
};

const missing_skuSchema = {
  name: "missing_sku",
  properties: {
    _id: "objectId?",
    __v: "int?",
    _partitionKey: "string?",
    batchId: "string?",
    batchType: "string?",
    client: "string?",
    itemId: "string?",
    name: "string?",
    orderId: "string?",
    orderItemId: "string?",
    orderNumber: "string?",
    sku: "string?",
  },
  primaryKey: "_id",
};

const schema = {
  stationSchema,
  employeeSchema,
  timeSchema,
  time_stepsSchema,
  productSchema,
  product_stepsSchema,
  product_steps_stepSchema,
  itemSchema,
  item_locationSchema,
  item_location_checkpointsSchema,
  item_quantitySchema,
  missing_skuSchema,
};

module.exports = schema;
