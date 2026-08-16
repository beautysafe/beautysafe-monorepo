import { Module } from '@nestjs/common';
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
import { BannersModule } from './banners/banners.module';
import { StoriesModule } from './stories/stories.module';
import { GroupsModule } from './groups/groups.module';
import { SubgroupsModule } from './subgroups/subgroups.module';
import { ProductListsModule } from './product-lists/product-lists.module';
import { JourneysModule } from './journeys/journeys.module';

import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { StorageModule } from './storage/storage.module';
import { UnavailableProductsModule } from './unavailable-products/unavailable-products.module';
import { ProductFeedbackModule } from './product-feedback/product-feedback.module';
import { ScansModule } from './scans/scans.module';
import { join } from 'path';
import { QueryFailedErrorFilter } from './common/filters/query-failed-error.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize:
        process.env.NODE_ENV !== 'production' &&
        process.env.DB_SYNCHRONIZE === 'true',
      migrations: [join(__dirname, 'database', 'migrations', '*.{js,ts}')],
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
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
    BannersModule,
    StoriesModule,
    GroupsModule,
    SubgroupsModule,
    ProductListsModule,
    JourneysModule,
    StorageModule,
    UnavailableProductsModule,
    ProductFeedbackModule,
    ScansModule,
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
    {
      provide: APP_FILTER,
      useClass: QueryFailedErrorFilter,
    },
  ],
})
export class AppModule {}
