import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/accessToken.guard';
import { RolesGuard } from './auth/guards/role.guard';
import { TransactionsModule } from './transactions/transactions.module';
import { UploadModule } from './upload/upload.module';
import { TasksModule } from './tasks/tasks.module';
import { PaymeModule } from './payme/payme.module';
import { PromoModule } from './promo/promo.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BannerModule } from './banner/banner.module';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    WishlistModule,
    PrismaModule,
    TransactionsModule,
    UploadModule,
    TasksModule,
    PaymeModule,
    PromoModule,
    SubscriptionsModule,
    BannerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class ApiModule {}
