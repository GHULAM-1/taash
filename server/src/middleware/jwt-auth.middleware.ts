import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@/services/config.service';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly cfg: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const token =
      req.cookies?.token ??
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = jwt.verify(token, this.cfg.jwtSecret) as {
        id: string;
        email: string;
      };
      req.user = { id: payload.id, email: payload.email };
      next();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
