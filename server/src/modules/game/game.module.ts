// src/modules/game/game.module.ts
import { Module }         from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from '@/controllers/game/game.controller';
import { GameService }    from '@/services/game/game.service';
import { Game, GameSchema } from '@/types/game.schema';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
