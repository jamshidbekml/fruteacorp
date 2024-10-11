import { ConfigService } from '@nestjs/config';

export function generatePaymeUrl(orderId: string, amount: number) {
  const config = new ConfigService();

  const url = config.get<string>('PAYME_URL');
  const m = config.get<string>('PAYME_MERCHANT_ID');

  const data =
    url +
    Buffer.from(
      `m=${m};ac.order_id=${orderId};a=${amount};l=${'uz'};cr=${'UZS'}`,
    ).toString('base64');

  return data;
}
