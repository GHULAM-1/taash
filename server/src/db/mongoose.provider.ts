import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@/modules/config/config.module';
import { ConfigService } from '@/services/config.service';

export const MongooseProvider = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (cfg: ConfigService) => ({
    uri: cfg.mongoUri,              
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }),
  inject: [ConfigService],
});