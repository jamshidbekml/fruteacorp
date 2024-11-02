export class ConfirmActionDto {
  click_trans_id: number;
  service_id: number;
  click_paydoc_id: number;
  merchant_trans_id: string;
  merchant_prepare_id: number;
  amount: number;
  action: 1;
  error: number;
  error_note: string;
  sign_time: string;
  sign_string: string;
}
