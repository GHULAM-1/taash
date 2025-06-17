import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '../config.service';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  private googleClient = new OAuth2Client(
    this.cfg.googleClientId,
  );

  constructor(private readonly cfg: ConfigService) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS must be set');
    }
  }

  async sendVerificationEmail(email: string, userId: string) {
    const token = jwt.sign({ id: userId }, this.cfg.jwtSecret, {
      expiresIn: '15m',
    });
    const url = `http://${this.cfg.resetUrlBase}/verify-email?token=${token}`;
    console.log("verify: ", url)
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `Click <a href="${url}">Here</a> to verify. Expires in 15m.`,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      resetUrl,
    )}&size=200x200`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Tap “Open App” in your Expo Go app, then scan this QR code to reset your password:</p>
        <img src="${qrUrl}" alt="Reset Password QR Code" />
        <p>If you can’t scan, you can copy-paste this link into Expo Go’s “Open from clipboard”:</p>
        <p><code>${resetUrl}</code></p>
      `,
    });

    return { message: 'Reset link sent to email' };
  }

  async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.cfg.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new BadRequestException('Unable to extract email from token');
    }
    return payload;
  }
}
