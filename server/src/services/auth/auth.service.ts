import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { EmailService } from "../email/email.service";
import { ConfigService } from "../config.service";
import { User, UserDocument } from "@/types/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly users: UserService,
    private readonly jwtSvc: JwtService,
    private readonly email: EmailService,
    private readonly cfg: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    ) {}

  async signup(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException("Email & password required");
    }
    if (await this.users.findByEmail(email)) {
      throw new BadRequestException("Already registered; please login");
    }
    const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
    const user = await this.users.create({
      email,
      password: hash,
      provider: "email",
      verified: false,
    });
    await this.email.sendVerificationEmail(user.email, user._id.toString());
    return { message: "User created" };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    if (!email || !password) {
      throw new BadRequestException({ error: 'Email & password required' });
    }
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .exec();
    if (!user) {
      throw new UnauthorizedException({ error: 'Invalid credentials' });
    }
    console.log(user,"from 1st if")
    if (!(await bcrypt.compare(password, user.password!))) {
      throw new UnauthorizedException({ error: 'Invalid credentials' });
    }
    console.log(user,"from 2nd if")
    if (!user.verified) {
      throw new ForbiddenException({
        error: 'Please verify your email first.',
      });
    }
    const token = this.jwtSvc.sign(
      { id: user._id.toString(), email },
      { expiresIn: '1d' },
    );
    return { token };
  }

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestException("Email required");

    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException("User not found");

    const token = jwt.sign({ id: user._id.toString() }, this.cfg.jwtSecret, {
      expiresIn: "15m",
    });

    const expoHost = "192.168.1.168:8081"; 
    const resetUrl = `exp://${expoHost}/--/reset-password?token=${token}`;
    console.log("Password reset URL:", resetUrl);
    return this.email.sendPasswordResetEmail(email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new BadRequestException("Token and new password required");
    }
    let payload: { id: string };
    try {
      payload = jwt.verify(token, this.cfg.jwtSecret) as any;
    } catch {
      throw new BadRequestException("Invalid or expired token.");
    }
    console.log("new pass", newPassword)
    const hash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.users.updatePassword(payload.id, hash);
    return { message: "Password has been reset successfully." };
  }

  async googleSignup(idToken: string) {
    if (!idToken) throw new BadRequestException("idToken required");
    const ticket = await this.email.verifyGoogleToken(idToken);
    const { email } = ticket;
    if (!email) {
      throw new BadRequestException("Google token did not include an email");
    }
    if (await this.users.findByEmail(email)) {
      throw new BadRequestException("User exists; please login");
    }
    await this.users.create({ email, provider: "google", verified: true });
    return { message: "User created via Google" };
  }

  async googleLogin(idToken: string): Promise<{ token: string }> {
    if (!idToken) throw new BadRequestException("idToken required");
    const ticket = await this.email.verifyGoogleToken(idToken);
    const { email } = ticket;
    if (!email) {
      throw new BadRequestException("Google token did not include an email");
    }
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException("User does not exist");
    const token = this.jwtSvc.sign(
      { id: user._id.toString(), email },
      { expiresIn: "1d" }
    );
    return { token };
  }

  me(id: string) {
    return this.users.findById(id);
  }

  logout() {
    return { message: "Logged out" };
  }
}
