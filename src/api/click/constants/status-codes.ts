export const ClickError = {
  Success: 0, //success
  SignFailed: -1,
  InvalidAmount: -2, //invalid amount
  ActionNotFound: -3,
  AlreadyPaid: -4, //already paid
  UserNotFound: -5, // user not found
  TransactionNotFound: -6, //transaction not found
  BadRequest: -8,
  TransactionCanceled: -9, //transaction canceled
};

export const ClickAction = {
  Prepare: 1,
  Confirm: 2,
};

export const TransactionStatus = {
  Pending: 'PENDING',
  Paid: 'PAID',
  Canceled: 'CANCELED',
};
