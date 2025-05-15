// src/controllers/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService }    from '../../services/auth/auth.service';
import { ConfigService }  from '../../services/config.service';
import { JwtAuthGuard }   from '../../guards/jwt-auth.guard';

type AuthRequest = Request & { user: { id: string; email: string } };

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cfg: ConfigService,
  ) {}

  @Post('signup')
  signup(@Body() dto: { email: string; password: string }) {
    return this.auth.signup(dto.email, dto.password);
  }

  @Post('login')
  async login(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log("hiiii")
    const { token } = await this.auth.login(dto.email, dto.password);
    res.cookie('token', token, this.cfg.cookieOptions);
    return { message: 'Logged in' };
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.auth.resetPassword(token, password);
  }

  @Post('google/signup')
  googleSignup(@Body('idToken') idToken: string) {
    return this.auth.googleSignup(idToken);
  }

  @Post('google/login')
  async googleLogin(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = await this.auth.googleLogin(idToken);
    res.cookie('token', token, this.cfg.cookieOptions);
    return { message: 'Logged in via Google' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.auth.me(req.user.id);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', this.cfg.cookieOptions);
    return this.auth.logout();
  }
}
