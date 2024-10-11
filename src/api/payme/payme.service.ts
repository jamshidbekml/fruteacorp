import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';

@Injectable()
export class PaymeService {
  // async handleTransactionMethods(reqBody: PaymeRequestBody) {
  //   const method = reqBody.method;
  //   switch (method) {
  //     case TransactionMethods.CheckPerformTransaction:
  //       return await this.checkPerformTransaction(
  //         reqBody as CheckPerformTransactionDto,
  //       );
  //     case TransactionMethods.CreateTransaction:
  //       return await this.createTransaction(reqBody as CreateTransactionDto);
  //     case TransactionMethods.PerformTransaction:
  //       return await this.performTransaction(reqBody as PerformTransactionDto);
  //     case TransactionMethods.CheckTransaction:
  //       return await this.checkTransaction(reqBody as CheckTransactionDto);
  //     case TransactionMethods.CancelTransaction:
  //       return await this.cancelTransaction(reqBody as CancelTransactionDto);
  //     case TransactionMethods.GetStatement:
  //       return await this.getStatement(reqBody as GetStatementDto);
  //     default:
  //       return 'Invalid transaction method';
  //   }
  // }
}
