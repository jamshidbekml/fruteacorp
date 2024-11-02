export class PrepareActionDto {
  click_trans_id: number;
  service_id: number;
  click_paydoc_id: number;
  merchant_trans_id: string;
  amount: number;
  action: 0;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}
