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
import { BannerModule } from './banner/banner.module';
import { AddressModule } from './address/address.module';
import { AreasModule } from './areas/areas.module';
import { ReviewModule } from './review/review.module';
import { ClickModule } from './click/click.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OperatorModule } from './operator/operator.module';
import { PackmanModule } from './packman/packman.module';
import { ExelModule } from './exel/exel.module';
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
    BannerModule,
    AddressModule,
    AreasModule,
    ReviewModule,
    ClickModule,
    DashboardModule,
    OperatorModule,
    PackmanModule,
    ExelModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class ApiModule {}
