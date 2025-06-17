import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@/modules/config/config.module";
import { ConfigService } from "@/services/config.service";
import { AuthController } from "@/controllers/auth/auth.controller";
import { AuthService } from "@/services/auth/auth.service";
import { JwtStrategy } from "@/guards/jwt.strategy";
import { UserModule } from "@/modules/user/user.module";
import { EmailModule } from "@/modules/email/email.module";
import { User, UserSchema } from "@/types/user.schema";

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.jwtSecret,
      }),
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
