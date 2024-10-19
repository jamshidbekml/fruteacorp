import { Injectable } from '@nestjs/common';
import { TransactionMethods } from './constants/transaction-methods';
import { PaymeRequestBody } from './types/incoming-request-body';
import { CheckPerformTransactionDto } from './dto/check-perform-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorStatusCodes } from './constants/error-status-codes';
import { PaymeError } from './constants/payme-error';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionState } from './constants/transaction-state';
import { PerformTransactionDto } from './dto/perform-transaction.dto';
import { CancelingReasons } from './constants/canceling-resons';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { CheckTransactionDto } from './dto/check-transaction.dto';
import { GetStatementDto } from './dto/get-statement.dto';
import { DateTime } from 'luxon';
@Injectable()
export class PaymeService {
  constructor(private readonly prismaService: PrismaService) {}

  async handleTransactionMethods(reqBody: PaymeRequestBody) {
    const method = reqBody.method;
    switch (method) {
      case TransactionMethods.CheckPerformTransaction:
        return await this.checkPerformTransaction(
          reqBody as CheckPerformTransactionDto,
        );
      case TransactionMethods.CreateTransaction:
        return await this.createTransaction(reqBody as CreateTransactionDto);
      case TransactionMethods.PerformTransaction:
        return await this.performTransaction(reqBody as PerformTransactionDto);
      case TransactionMethods.CheckTransaction:
        return await this.checkTransaction(reqBody as CheckTransactionDto);
      case TransactionMethods.CancelTransaction:
        return await this.cancelTransaction(reqBody as CancelTransactionDto);
      case TransactionMethods.GetStatement:
        return await this.getStatement(reqBody as GetStatementDto);
      default:
        return 'Invalid transaction method';
    }
  }

  async checkPerformTransaction(
    checkPerformTransactionDto: CheckPerformTransactionDto,
  ) {
    const orderId = checkPerformTransactionDto.params?.account?.order_id;

    const order = await this.prismaService.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return {
        error: PaymeError.OrderNotFound,
      };
    }

    if (
      Number(order.totalAmount) !== checkPerformTransactionDto.params.amount
    ) {
      return {
        error: PaymeError.InvalidAmount,
      };
    }
    return {
      result: {
        allow: true,
      },
    };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const orderId = createTransactionDto.params?.account?.order_id;
    const transId = createTransactionDto.params?.id;

    const order = await this.prismaService.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return {
        error: PaymeError.OrderNotFound,
      };
    }

    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        uid: transId,
      },
    });

    if (transaction) {
      if (transaction.state !== TransactionState.Pending) {
        return {
          error: PaymeError.CantDoOperation,
        };
      }

      if (this.checkTransactionExpiration(transaction.createdAt)) {
        await this.prismaService.transactions.update({
          where: {
            uid: transId,
          },
          data: {
            status: 'cancelled',
            cancelTime: new Date(),
            state: TransactionState.PendingCanceled,
            reason: CancelingReasons.CanceledDueToTimeout,
          },
        });

        return {
          error: {
            ...PaymeError.CantDoOperation,
            state: TransactionState.PendingCanceled,
            reason: CancelingReasons.CanceledDueToTimeout,
          },
        };
      }

      return {
        result: {
          transaction: transaction.id,
          state: TransactionState.Pending,
          create_time: new Date(transaction.createdAt).getTime(),
        },
      };
    }

    const checkTransaction: CheckPerformTransactionDto = {
      method: TransactionMethods.CheckPerformTransaction,
      params: {
        amount: Number(order.totalAmount),
        account: {
          order_id: orderId,
        },
      },
    };

    const checkResult = await this.checkPerformTransaction(checkTransaction);

    if (checkResult.error) {
      return {
        error: checkResult.error,
      };
    }

    const newTransaction = await this.prismaService.transactions.create({
      data: {
        uid: createTransactionDto.params.id,
        state: TransactionState.Pending,
        status: 'pending',
        amount: createTransactionDto.params.amount,
        orederId: orderId,
      },
    });

    return {
      result: {
        transaction: newTransaction.id,
        state: TransactionState.Pending,
        create_time: new Date(newTransaction.createdAt).getTime(),
      },
    };
  }

  async performTransaction(performTransactionDto: PerformTransactionDto) {
    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        uid: performTransactionDto.params.id,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.TransactionNotFound,
      };
    }

    if (transaction.state !== 1) {
      if (transaction.state !== 2) {
        return {
          error: PaymeError.CantDoOperation,
        };
      }

      return {
        result: {
          state: transaction.state,
          transaction: transaction.id,
          perform_time: new Date(transaction.performTime).getTime(),
        },
      };
    }

    const expirationTime = this.checkTransactionExpiration(
      transaction.createdAt,
    );

    if (expirationTime) {
      await this.prismaService.transactions.update({
        where: {
          uid: performTransactionDto.params.id,
        },
        data: {
          status: 'cancelled',
          cancelTime: new Date(),
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
        },
      });

      return {
        error: {
          state: TransactionState.PendingCanceled,
          reason: CancelingReasons.CanceledDueToTimeout,
          ...PaymeError.CantDoOperation,
        },
      };
    }

    const performTime = new Date();

    const updatedPayment = await this.prismaService.transactions.update({
      where: {
        uid: performTransactionDto.params.id,
      },
      data: {
        status: 'paid',
        state: TransactionState.Paid,
        performTime,
      },
    });

    return {
      result: {
        transaction: updatedPayment.id,
        perform_time: performTime.getTime(),
        state: TransactionState.Paid,
      },
    };
  }

  async cancelTransaction(cancelTransactionDto: CancelTransactionDto) {
    const transId = cancelTransactionDto.params.id;

    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        uid: transId,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.TransactionNotFound,
      };
    }

    if (transaction.state === TransactionState.Pending) {
      const cancelTransaction = await this.prismaService.transactions.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: 'cancelled',
          state: TransactionState.PendingCanceled,
          cancelTime: new Date(),
          reason: cancelTransactionDto.params.reason,
        },
      });

      return {
        result: {
          cancel_time: cancelTransaction.cancelTime.getTime(),
          transaction: cancelTransaction.id,
          state: TransactionState.PendingCanceled,
        },
      };
    }

    if (transaction.state !== TransactionState.Paid) {
      return {
        result: {
          state: transaction.state,
          transaction: transaction.id,
          cancel_time: transaction.cancelTime.getTime(),
        },
      };
    }

    const updatedTransaction = await this.prismaService.transactions.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'cancelled',
        state: TransactionState.PaidCanceled,
        cancelTime: new Date(),
        reason: cancelTransactionDto.params.reason,
      },
    });

    return {
      result: {
        cancel_time: updatedTransaction.cancelTime.getTime(),
        transaction: updatedTransaction.id,
        state: TransactionState.PaidCanceled,
      },
    };
  }

  async checkTransaction(checkTransactionDto: CheckTransactionDto) {
    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        uid: checkTransactionDto.params.id,
      },
    });

    if (!transaction) {
      return {
        error: PaymeError.TransactionNotFound,
      };
    }

    return {
      result: {
        create_time: transaction.createdAt.getTime(),
        perform_time: new Date(transaction.performTime).getTime(),
        cancel_time: new Date(transaction.cancelTime).getTime(),
        transaction: transaction.id,
        state: transaction.state,
        reason: transaction.reason,
      },
    };
  }

  async getStatement(getStatementDto: GetStatementDto) {
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        createdAt: {
          gte: new Date(getStatementDto.params.from),
          lte: new Date(getStatementDto.params.to),
        },
      },
    });

    return {
      result: {
        transactions: transactions.map((transaction) => {
          return {
            id: transaction.uid,
            time: new Date(transaction.createdAt).getTime(),
            amount: transaction.amount,
            account: {
              order_id: transaction.orederId,
            },
            create_time: new Date(transaction.createdAt).getTime(),
            perform_time: new Date(transaction.performTime).getTime(),
            cancel_time: new Date(transaction.cancelTime).getTime(),
            transaction: transaction.id,
            state: transaction.state,
            reason: transaction.reason || null,
          };
        }),
      },
    };
  }

  private checkTransactionExpiration(createdAt: Date) {
    const transactionCreatedAt = new Date(createdAt);
    const timeoutDuration = 720;
    const timeoutThreshold = DateTime.now()
      .minus({
        minutes: timeoutDuration,
      })
      .toJSDate();

    return transactionCreatedAt < timeoutThreshold;
  }
}
