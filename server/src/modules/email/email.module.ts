import { Module } from '@nestjs/common';
import { EmailService } from '@/services/email/email.service';
import { ConfigModule } from '@/modules/config/config.module';

@Module({
  imports:  [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
