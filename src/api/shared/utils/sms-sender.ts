import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export async function smsSender(phone: string, message: string) {
  try {
    const config = new ConfigService();

    await axios.post(
      `${config.get<string>('ESKIZ_URL')}api/message/sms/send`,
      {
        mobile_phone: phone,
        message,
        from: '4546',
      },
      {
        headers: {
          Authorization: `Bearer ${config.get('ESKIZ_TOKEN')}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return true;
  } catch (err) {
    console.log(`Error sending SMS: ${err.message}`.bgRed.white);
    return false;
  }
}
