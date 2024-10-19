export const PaymeError = {
  InvalidAmount: {
    name: 'InvalidAmount',
    code: -31001,
    message: {
      uz: "Noto'g'ri summa",
      ru: 'Недопустимая сумма',
      en: 'Invalid amount',
    },
  },
  OrderNotFound: {
    name: 'OrderNotFound',
    code: -31050,
    message: {
      uz: 'Bunday buyurtma topilmadi.',
      ru: 'Заказ не найден.',
      en: 'Order not found.',
    },
  },
  InvalidAccount: {
    name: 'InvalidAccount',
    code: -31050,
    message: {
      ru: 'Мы не нашли вашу учетную запись',
      uz: 'Biz sizning hisobingizni topolmadik.',
      en: "We couldn't find your account",
    },
  },
  CantDoOperation: {
    name: 'CantDoOperation',
    code: -31008,
    message: {
      uz: 'Biz operatsiyani bajara olmaymiz',
      ru: 'Мы не можем сделать операцию',
      en: "We can't do operation",
    },
  },
  CannotBeReversed: {
    name: 'CannotBeReversed',
    code: -31007,
    message: {
      uz: "To'lovni qaytarib bo'lmaydi",
      ru: 'Не может быть возвращено',
      en: 'Cannot be reversed',
    },
  },
  TransactionNotFound: {
    name: 'TransactionNotFound',
    code: -31003,
    message: {
      uz: 'Tranzaktsiya topilmadi',
      ru: 'Транзакция не найдена',
      en: 'Transaction not found',
    },
  },
  AlreadyDone: {
    name: 'AlreadyDone',
    code: -31060,
    message: {
      uz: "Mahsulot uchun to'lov qilingan",
      ru: 'Оплачено за товар',
      en: 'Paid for the product',
    },
  },
  Pending: {
    name: 'Pending',
    code: -31050,
    message: {
      uz: "Mahsulot uchun to'lov kutilayapti",
      ru: 'Ожидается оплата товар',
      en: 'Payment for the product is pending',
    },
  },
  InvalidAuthorization: {
    name: 'InvalidAuthorization',
    code: -32504,
    message: {
      uz: 'Avtorizatsiya yaroqsiz',
      ru: 'Авторизация недействительна',
      en: 'Authorization invalid',
    },
  },
};
