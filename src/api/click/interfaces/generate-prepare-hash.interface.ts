export interface GenerateMd5HashParams {
  clickTransId: number;
  serviceId: number;
  secretKey: string;
  merchantTransId: string;
  amount: number;
  action: number;
  signTime: string;
  merchantPrepareId?: number;
}
