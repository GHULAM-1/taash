import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../services/user/user.service';
import { ConfigService } from '../../services/config.service';

@Controller()
export class VerifyController {
  constructor(
    private readonly users: UserService,
    private readonly cfg: ConfigService,
  ) {}

  @Get('verify-email')
  async verify(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) throw new BadRequestException('Token is required');
    let payload: { id: string };
    try {
      payload = jwt.verify(token, this.cfg.jwtSecret) as any;
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.users.findById(payload.id);
    if (user.verified) {
      return res.send('Email already verified');
    }

    await this.users.markVerified(payload.id);
    return res.send(
      'Email verified successfully. You can now open the app and log in.',
    );
  }
}
