import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { nanoid } from "nanoid";
import Pusher from "pusher";
import { Game, GameDocument } from "@/types/game.schema";
import { ConfigService } from "../config.service";

@Injectable()
export class GameService {
  private pusher: Pusher;

  constructor(
    @InjectModel(Game.name) private gameModel: Model<GameDocument>,
    private readonly cfg: ConfigService,                         // ← inject
  ) {
    const { pusherAppId, pusherKey, pusherSecret, pusherCluster } = this.cfg;

    if (!pusherAppId || !pusherKey || !pusherSecret || !pusherCluster) {
      throw new Error(
        "Missing Pusher configuration: ensure PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET and PUSHER_CLUSTER are set"
      );
    }

    this.pusher = new Pusher({
      appId:   pusherAppId,
      key:     pusherKey,
      secret:  pusherSecret,
      cluster: pusherCluster,
      useTLS:  true,
    });
  }


  async createGame(name: string, ownerId: string): Promise<{ roomId: string }> {
    if (!name.trim()) throw new BadRequestException("Name is required");
    const roomId = nanoid(6).toUpperCase();
    await this.gameModel.create({ name, roomId, owner: ownerId });
    return { roomId };
  }

  async findMyGames(
    ownerId: string
  ): Promise<Array<{ id: string; name: string; roomId: string }>> {
    const docs = await this.gameModel
      .find({ owner: ownerId })
      .lean() 
      .exec();
    return docs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      roomId: d.roomId,
    }));
  }

  auth(
    socketId: string,
    channel: string,
    userId: string,
    userInfo: { name: string }
  ) {
    if (!socketId || !channel || !userId) {
      throw new BadRequestException("Missing auth parameters");
    }
    return this.pusher.authenticate(socketId, channel, {
      user_id: userId,
      user_info: userInfo,
    });
  }
}
