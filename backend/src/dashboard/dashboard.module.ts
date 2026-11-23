import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
