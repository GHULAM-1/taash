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
    private readonly cfg: ConfigService // ← inject
  ) {
    const { pusherAppId, pusherKey, pusherSecret, pusherCluster } = this.cfg;

    if (!pusherAppId || !pusherKey || !pusherSecret || !pusherCluster) {
      throw new Error(
        "Missing Pusher configuration: ensure PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET and PUSHER_CLUSTER are set"
      );
    }

    this.pusher = new Pusher({
      appId: pusherAppId,
      key: pusherKey,
      secret: pusherSecret,
      cluster: pusherCluster,
      useTLS: true,
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
    const docs = await this.gameModel.find({ owner: ownerId }).lean().exec();
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
  async dealCards(roomId: string): Promise<{
    players: string[];
    cardsPerPlayer: number;
    kittyCount: number;
  }> {
    if (!roomId) {
      throw new BadRequestException("roomId required");
    }

    const resp = await this.pusher.get({
      path: `/channels/presence-${roomId}/users`,
    });
    const body: { users: Array<{ id: string }> } = await resp.json();
    const members = body.users;
    if (!members || members.length < 2) {
      throw new BadRequestException("No players in that room");
    }

    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const deck = suits.flatMap(s => ranks.map(r => `${r}${s}`));

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const numPlayers = members.length;
    const handSize = Math.floor(deck.length / numPlayers);
    const hands: Record<string, string[]> = {};
    members.forEach((m, idx) => {
      hands[m.id] = deck.slice(
        idx * handSize,
        idx * handSize + handSize
      );
    });
    const kittyCount = deck.length - numPlayers * handSize;

    members.forEach(m => {
      this.pusher.trigger(
        `presence-${roomId}`,    
        "client-deal",           
        {
          recipient: m.id,       
          hand:      hands[m.id],
        }
      );
    });

    return {
      players: members.map(m => m.id),
      cardsPerPlayer: handSize,
      kittyCount,
    };
  }
}
