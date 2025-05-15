import dotenv from 'dotenv';
dotenv.config();
const {
  NODE_ENV   = 'development',
  PORT       = '3000',
  MONGO_URI,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  FRONTEND_URL,
} = process.env;

export const env: string            = NODE_ENV;
export const port: number           = parseInt(PORT, 10);
export const mongoUri: string       = MONGO_URI || "";
export const jwtSecret: string      = JWT_SECRET || "";
export const googleClientId: string = GOOGLE_CLIENT_ID || "";
export const frontendUrl: string    = FRONTEND_URL!;

export const cookieOptions = {
  httpOnly:  true,
  secure:    env === 'production',
  sameSite:  env === 'production' ? 'none' as const : 'lax' as const,
  maxAge:    24 * 60 * 60 * 1000, // 1 day
};
