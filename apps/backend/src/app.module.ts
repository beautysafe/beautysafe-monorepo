import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { SubsubcategoriesModule } from './subsubcategories/subsubcategories.module';
import { BrandsModule } from './brands/brands.module';
import { FlagsModule } from './flags/flags.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { FamiliesModule } from './families/families.module';

import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'beauty',
      password: process.env.DB_PASS || 'safe123',
      database: process.env.DB_NAME || 'beautysafe',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SubcategoriesModule,
    SubsubcategoriesModule,
    BrandsModule,
    FlagsModule,
    IngredientsModule,
    FamiliesModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
