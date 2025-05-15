import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import User from "@/models/User";
import authMiddleware from "@/middleware/auth";
import { sendVerificationEmail } from "@/routes/verify";
import { jwtSecret, cookieOptions, googleClientId } from "@/config";

const router = Router();
const SALT_ROUNDS = 10;

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
if (!emailUser || !emailPass) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be set in env");
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: emailUser, pass: emailPass },
});

const googleClient = new OAuth2Client(googleClientId);

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };
      if (!email || !password) {
        res.status(400).json({ error: "Email & password required" });
        return;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ error: "Already registered; please login" });
        return;
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await User.create({
        email,
        password: hashed,
        provider: "email",
        verified: false,
      });

      await sendVerificationEmail(user.email, user.id);

      res.status(201).json({ message: "User created" });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };
      if (!email || !password) {
        res.status(400).json({ error: "Email & password required" });
        return;
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const passwordsMatch = await bcrypt.compare(password, user.password!);
      if (!passwordsMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      if (!user.verified) {
        res.status(403).json({ error: "Please verify your email first." });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
        expiresIn: "1d",
      });
      res.cookie("token", token, cookieOptions);
      res.json({ message: "Logged in" });
    } catch (err) {
      next(err);
    }
  }
);

// --- Forgot Password ------------------------------------------------------
router.post(
  "/forgot-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email) {
        res.status(400).json({ error: "Email required" });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: "15m",
      });
      const expoHost = `192.168.1.168:8081`;
      const resetUrl = `exp://${expoHost}/--/reset-password?token=${token}`;
      console.log(resetUrl);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        resetUrl
      )}&size=200x200`;

      await transporter.sendMail({
        to: email,
        subject: "Reset Your Password",
        html: `
          <p>Tap “Open App” in your Expo Go app, then scan this QR code to reset your password:</p>
          <img src="${qrUrl}" alt="Reset Password QR Code" />
          <p>If you can’t scan, you can copy-paste this link into Expo Go’s “Open from clipboard”:</p>
          <p><code>${resetUrl}</code></p>
        `,
      });

      res.json({ message: "Reset link sent to email" });
    } catch (err) {
      next(err);
    }
  }
);

// --- Reset Password -------------------------------------------------------
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body as {
        token?: string;
        password?: string;
      };
      console.log(password, "new");
      if (!token || !password) {
        res.status(400).json({ error: "Token and new password required" });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
      };
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const hashed = await bcrypt.hash(password, SALT_ROUNDS);
      user.password = hashed;
      await user.save();

      res.json({ message: "Password has been reset successfully." });
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  }
);

// --- Google OAuth signup -------------------------------------------------
router.post(
  "/google/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        res.status(400).json({ error: "idToken required" });
        return;
      }
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        res.status(400).json({ error: "Unable to extract email from token" });
        return;
      }
      const { email } = payload;
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ error: "User exists; please login" });
        return;
      }

      const user = new User({
        email,
        provider: "google",
        verified: true,
      });
      await user.save();

      res.status(201).json({ message: "User created via Google" });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/google/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body as { idToken?: string };
      if (!idToken) {
        res.status(400).json({ error: "idToken required" });
        return;
      }
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        res.status(400).json({ error: "Unable to extract email from token" });
        return;
      }
      const { email } = payload;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: "User does not exist" });
        return;
      }

      const token = jwt.sign(
        { id: user.id.toString(), email: user.email },
        jwtSecret,
        { expiresIn: "1d" }
      );
      res.cookie("token", token, cookieOptions);
      res.json({ message: "Logged in" });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/me",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }
);

// --- Logout ---------------------------------------------------------------
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
});

export default router;
