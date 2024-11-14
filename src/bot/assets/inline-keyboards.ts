import { InlineKeyboard } from 'grammy';

const InlineKeyboards = {
  confirm_order_operator: (id: string) =>
    new InlineKeyboard().text(
      '📥 Qabul qilish',
      `confirm_operator?order_id=${id}`,
    ),
  confirm_order_packman: (id: string) =>
    new InlineKeyboard().text(
      '📥 Qabul qilish',
      `confirm_packman?order_id=${id}`,
    ),
};

export default InlineKeyboards;
