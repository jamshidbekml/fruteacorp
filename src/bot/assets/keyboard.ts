import { Keyboard } from 'grammy';
import messages from './messages';

const Keyboards = {
  main_menu: new Keyboard()
    .text(messages.profile)
    .text('📒 Buyurtmalar')
    .resized(),
  contact: new Keyboard().requestContact('Share Contact').resized(),
};

export default Keyboards;
