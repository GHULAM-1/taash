// src/controllers/game.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  HttpCode,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { GameService } from "@/services/game/game.service";

interface CreateDto {
  name: string;
}
interface AuthDto {
  socket_id: string;
  roomId: string;
  userId: string;
  name: string;
}

@Controller("api/game")
@UseGuards(AuthGuard("jwt"))
export class GameController {
  constructor(private readonly games: GameService) {}

  /** Create a new room */
  @Post("create")
  async create(@Req() req: Request, @Body() dto: CreateDto) {
    // req.user is populated by JwtStrategy
    const ownerId = (req.user as any).id;
    return this.games.createGame(dto.name, ownerId);
  }

  /** List rooms you’ve created */
  @Get("my")
  async my(@Req() req: Request) {
    const ownerId = (req.user as any).id;
    return this.games.findMyGames(ownerId);
  }

  /** Pusher Presence auth (no Jwt guard here if you prefer public) */
  // src/controllers/game.controller.ts
  @Post("auth")
  @HttpCode(200)    // <<< ensure we return HTTP 200, not 201
  auth(@Body() dto: any) {
    console.log("Pusher auth body:", dto);
    const { socket_id, channel_name, userId, name } = dto;
    if (!socket_id || !channel_name || !userId) {
      throw new BadRequestException("Missing auth parameters");
    }
    // Trust channel_name from Pusher
    return this.games.auth(socket_id, channel_name, userId, { name });
  }
}
