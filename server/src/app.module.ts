import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { JwtAuthMiddleware } from "./middleware/jwt-auth.middleware";
import { EmailModule } from "./modules/email/email.module";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { MongooseProvider } from "./db/mongoose.provider";
import { ConfigModule } from "./modules/config/config.module";
import { VerifyController } from "./controllers/verify/verify.controller";
import { GameModule } from "./modules/game/game.module";

@Module({
  imports: [
    ConfigModule,
    MongooseProvider,
    AuthModule,
    EmailModule,
    UserModule,
    GameModule
  ],
  controllers: [VerifyController],
    providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes("*");
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        "api/auth/login",
        "api/auth/signup",
        "api/auth/reset-password",
        "api/auth/forgot-password",
        'verify-email',
      )
      .forRoutes("*");
  }
}
