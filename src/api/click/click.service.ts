import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClickError } from './constants/status-codes';
import { TransactionActions } from './constants/transaction-actions';
import { PrepareActionDto } from './dto/prepare-action.dto';
import { ConfirmActionDto } from './dto/confirm-action.dto';
import { ClickRequestBody } from './types/incoming-request-body';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateMd5HashParams } from './interfaces/generate-prepare-hash.interface';
import { createHash } from 'node:crypto';

@Injectable()
export class ClickService {
  private readonly secretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.secretKey = this.configService.get<string>('SECRET_KEY');
  }

  async handleMerchantTransactions(clickReqBody: ClickRequestBody) {
    const actionType = +clickReqBody.action;

    switch (actionType) {
      case TransactionActions.Prepare:
        return this.prepare(clickReqBody as PrepareActionDto);
      case TransactionActions.Confirm:
        return this.confirm(clickReqBody as ConfirmActionDto);
      default:
        return {
          error: ClickError.ActionNotFound,
          error_note: 'Invalid action',
        };
    }
  }

  async prepare(prepareActionDto: PrepareActionDto) {
    const orderId = prepareActionDto.merchant_trans_id;

    const myMD5Params = {
      clickTransId: prepareActionDto.click_trans_id,
      serviceId: prepareActionDto.service_id,
      secretKey: this.secretKey,
      merchantTransId: prepareActionDto.merchant_trans_id,
      amount: prepareActionDto.amount,
      action: prepareActionDto.action,
      signTime: prepareActionDto.sign_time,
    };

    const myMD5Hash = this.generateMD5(myMD5Params);

    if (prepareActionDto.sign_string !== myMD5Hash) {
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid Credentials',
      };
    }

    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return {
        error: ClickError.BadRequest,
        error_note: 'Order not found',
      };
    }

    console.log('totalAmount', order.totalAmount);
    console.log('amount', prepareActionDto.amount);
    if (Number(order.totalAmount) !== Number(prepareActionDto.amount)) {
      return {
        error: ClickError.InvalidAmount,
        error_note: 'Invalid amount',
      };
    }

    const transaction = await this.prismaService.transactions.findUnique({
      where: { uid: prepareActionDto.click_trans_id.toString() },
    });

    if (transaction && transaction.status === 'cancelled') {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Transaction canceled',
      };
    }

    if (transaction && transaction.status === 'paid') {
      return {
        error: ClickError.AlreadyPaid,
        error_note: 'Already paid',
      };
    }

    const time = new Date().getTime();

    const newTransaction = await this.prismaService.transactions.create({
      data: {
        uid: prepareActionDto.click_trans_id.toString(),
        amount: Number(prepareActionDto.amount) * 100,
        createdAt: new Date(time),
        status: 'pending',
        orederId: orderId,
        provider: 'click',
        prepareId: time.toString(),
      },
    });

    await this.prismaService.orders.update({
      where: { id: orderId },
      data: { status: 'pending_payment' },
    });

    return {
      click_trans_id: prepareActionDto.click_trans_id,
      merchant_trans_id: prepareActionDto.merchant_trans_id,
      merchant_prepare_id: newTransaction.prepareId,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }

  async confirm(confirmActionDto: ConfirmActionDto) {
    const myMD5Params = {
      clickTransId: confirmActionDto.click_trans_id,
      serviceId: confirmActionDto.service_id,
      secretKey: this.secretKey,
      merchantTransId: confirmActionDto.merchant_trans_id,
      amount: confirmActionDto.amount,
      action: confirmActionDto.action,
      signTime: confirmActionDto.sign_time,
    };

    const myMD5Hash = this.generateMD5(myMD5Params);

    if (confirmActionDto.sign_string !== myMD5Hash) {
      return {
        error: ClickError.SignFailed,
        error_note: 'Invalid Credentials',
      };
    }

    const order = await this.prismaService.orders.findUnique({
      where: { id: confirmActionDto.merchant_trans_id },
    });

    if (!order) {
      return {
        error: ClickError.UserNotFound,
        error_note: 'Order not found',
      };
    }

    const transaction = await this.prismaService.transactions.findUnique({
      where: {
        prepareId: confirmActionDto.merchant_prepare_id.toString(),
        uid: confirmActionDto.click_trans_id.toString(),
      },
    });

    if (!transaction) {
      return {
        error: ClickError.TransactionNotFound,
        error_note: 'Transaction not found',
      };
    }

    if (transaction && transaction.status == 'cancelled') {
      return {
        error: ClickError.TransactionCanceled,
        error_note: 'Transaction was canceled',
      };
    }

    await this.prismaService.transactions.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: 'paid',
      },
    });

    await this.prismaService.orders.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'paid',
      },
    });

    await this.prismaService.cart.deleteMany({
      where: {
        userId: order.userId,
      },
    });

    return {
      click_trans_id: confirmActionDto.click_trans_id,
      merchant_trans_id: confirmActionDto.merchant_trans_id,
      merchant_confirm_id: null,
      error: ClickError.Success,
      error_note: 'Success',
    };
  }

  public generateMD5(params: GenerateMd5HashParams, algo = 'md5') {
    const content = `${params.clickTransId}${params.serviceId}${params.secretKey}${params.merchantTransId}${params.amount}${params.action}${params.signTime}`;

    const hashFunc = createHash(algo);
    hashFunc.update(content);
    return hashFunc.digest('hex');
  }
}
