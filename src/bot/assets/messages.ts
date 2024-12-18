const messages = {
  main_menu: `📒 Bosh menu`,
  orders: `🗒 Buyurtmalar`,
  profile: `Profile`,
  first_message: `<b>Xush kelibsiz!</b>\nBot imkoniyatlaridan foydalanish uchun raqamingizni tasdiqlang.`,
  user_data: (data) =>
    `⚪️ Ism: ${data.firstName}\n⚪️ Familiya: ${data.lastName}\n⚪️ Telefon raqam: ${data.phone}\n\n🟡 Role: <b>${data.role == 'operator' ? 'Operator' : 'Yetkazib beruvchi'}</b>`,
  operator_order_data: (data) =>
    `👤 Mijoz: ${data.User.firstName} ${data.User.lastName}\n📞 Telefon: +${data.User.phone}
  \n📦 Mahsulotlar: \n${data.items.map((item) => `${item.quantity}x <b>${item.title_ru}</b>`).join('\n')}`,
  packman_order_data: (data) =>
    `👤 Mijoz: ${data.User.firstName} ${data.User.lastName}\n📞 Telefon: +${data.User.phone}\nLat: ${data.Address.lat}\nLong: ${data.Address.long}
  \n📦 Mahsulotlar: \n${data.items.map((item) => `${item.quantity}x <b>${item.title_ru}</b>`).join('\n')}`,
};

export default messages;
