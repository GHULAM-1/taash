import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConfigService {
  readonly env = process.env.NODE_ENV || 'development';
  readonly port = process.env.PORT || 3000;
  readonly mongoUri = process.env.MONGO_URI || '';
  readonly jwtSecret = process.env.JWT_SECRET || '';
  readonly googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  readonly frontendUrl = process.env.FRONTEND_URL || '';
  readonly resetUrlBase = process.env.RESET_URL || '';
  readonly pusherAppId   = process.env.PUSHER_APP_ID   || '';
  readonly pusherKey     = process.env.PUSHER_KEY      || '';
  readonly pusherSecret  = process.env.PUSHER_SECRET   || '';
  readonly pusherCluster = process.env.PUSHER_CLUSTER  || '';
  get isDev() {
    return this.env === 'development';
  }

  get cookieOptions() {
    return {
      httpOnly: true,
      secure: this.env === 'production',
      sameSite: this.env === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    } as const;
  }
  
}
