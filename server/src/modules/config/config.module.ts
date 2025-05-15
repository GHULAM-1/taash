import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService }    from '@/services/config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [ConfigService],
  exports:    [ConfigService],
})
export class ConfigModule {}
